import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import RolRepository from "../rol/rol.repository.js";
import { clearAuthUserCache } from "../../middlewares/auth.middleware.js";
import mongoose from "mongoose";
import ConductorRepository from "./conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import EmailService from "../auth/email.service.js";
import AppError from "../../utils/AppError.js";

const CATEGORIAS_VALIDAS_COLOMBIA = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];

function procesarCategoriasDetalle(item, fallbackExp, fallbackVenc) {
    let detalle = [];

    if (Array.isArray(item?.categoriasDetalle) && item.categoriasDetalle.length > 0) {
        const vistas = new Set();
        for (const entry of item.categoriasDetalle) {
            const cat = (entry?.categoria || "").toString().trim().toUpperCase();
            if (!cat) continue;
            if (!CATEGORIAS_VALIDAS_COLOMBIA.includes(cat)) {
                throw new AppError(`La categoría de licencia '${cat}' no es válida en Colombia.`, 400);
            }
            if (vistas.has(cat)) {
                throw new AppError(`La categoría '${cat}' está repetida en la licencia.`, 400);
            }
            vistas.add(cat);

            const exp = entry.fechaExpedicion ? new Date(entry.fechaExpedicion) : null;
            const venc = entry.fechaVencimiento ? new Date(entry.fechaVencimiento) : null;
            if (exp && venc && venc <= exp) {
                throw new AppError(`En la categoría '${cat}', la fecha de vencimiento debe ser posterior a la de expedición.`, 400);
            }
            detalle.push({ categoria: cat, fechaExpedicion: exp, fechaVencimiento: venc });
        }
    } else {
        let cats = [];
        if (Array.isArray(item?.categorias) && item.categorias.length > 0) cats = item.categorias;
        else if (Array.isArray(item?.categoriasLicencia) && item.categoriasLicencia.length > 0) cats = item.categoriasLicencia;
        else if (item?.categoria) cats = [item.categoria];
        cats = [...new Set(cats.map((c) => (c || "").toString().trim().toUpperCase()))].filter(Boolean);
        for (const cat of cats) {
            if (!CATEGORIAS_VALIDAS_COLOMBIA.includes(cat)) {
                throw new AppError(`La categoría de licencia '${cat}' no es válida en Colombia.`, 400);
            }
        }
        if (cats.length === 0) cats = ["B1"];
        const exp = fallbackExp ? new Date(fallbackExp) : null;
        const venc = fallbackVenc ? new Date(fallbackVenc) : null;
        detalle = cats.map((cat) => ({ categoria: cat, fechaExpedicion: exp, fechaVencimiento: venc }));
    }

    if (detalle.length === 0) {
        detalle = [{
            categoria: "B1",
            fechaExpedicion: fallbackExp ? new Date(fallbackExp) : null,
            fechaVencimiento: fallbackVenc ? new Date(fallbackVenc) : null
        }];
    }

    return detalle;
}

class ConductorService {
    async crear(datos) {
        // 1. Procesar licencia única (un conductor solo puede tener una licencia de conducción)
        if (Array.isArray(datos.licencias) && datos.licencias.length > 1) {
            throw new AppError("Un conductor solo puede tener una licencia de conducción registrada.", 400);
        }

        const licItem = Array.isArray(datos.licencias) && datos.licencias.length > 0 ? datos.licencias[0] : null;
        const licenciaPrincipal = (licItem?.numero || licItem?.licencia || datos.licencia || "").toString().trim().toUpperCase();

        if (!licenciaPrincipal) {
            throw new AppError("Debes registrar una licencia de conducción.", 400);
        }

        const licenciaExiste = await ConductorRepository.obtenerPorLicencia(licenciaPrincipal);
        if (licenciaExiste) {
            throw new AppError(`La licencia '${licenciaPrincipal}' ya se encuentra registrada en el sistema.`, 409);
        }

        const categoriasDetalle = procesarCategoriasDetalle(
            {
                categoriasDetalle: licItem?.categoriasDetalle || datos.categoriasDetalle,
                categorias: licItem?.categorias || datos.categoriasLicencia,
                categoria: licItem?.categoria || datos.categoriaLicencia
            },
            licItem?.fechaExpedicion || datos.fechaExpedicion,
            licItem?.fechaVencimiento || datos.fechaVencimiento
        );

        const categoriasList = categoriasDetalle.map((c) => c.categoria);
        const categoriaPrincipal = categoriasList[0];
        const fechaExpedicionPrincipal = categoriasDetalle[0]?.fechaExpedicion || (datos.fechaExpedicion ? new Date(datos.fechaExpedicion) : null);
        const fechaVencimientoPrincipal = categoriasDetalle[0]?.fechaVencimiento || (datos.fechaVencimiento ? new Date(datos.fechaVencimiento) : null);

        if (!fechaExpedicionPrincipal || !fechaVencimientoPrincipal) {
            throw new AppError("Las fechas de expedición y vencimiento de la licencia son obligatorias.", 400);
        }

        if (new Date(fechaVencimientoPrincipal) <= new Date(fechaExpedicionPrincipal)) {
            throw new AppError("La fecha de vencimiento debe ser posterior a la fecha de expedición de la licencia.", 400);
        }

        const fotoFrontal = licItem?.fotoLicenciaFrontal || datos.fotoLicenciaFrontal || licItem?.fotoLicencia || datos.fotoLicencia || null;
        const fotoTrasera = licItem?.fotoLicenciaTrasera || datos.fotoLicenciaTrasera || null;
        const lugarExpedicion = (licItem?.lugarExpedicion || datos.lugarExpedicion || "").toString().trim();

        const licenciasProcesadas = [
            {
                numero: licenciaPrincipal,
                categoria: categoriaPrincipal,
                categorias: categoriasList,
                categoriasDetalle,
                fechaExpedicion: fechaExpedicionPrincipal,
                fechaVencimiento: fechaVencimientoPrincipal,
                lugarExpedicion,
                fotoLicencia: fotoFrontal,
                fotoLicenciaFrontal: fotoFrontal,
                fotoLicenciaTrasera: fotoTrasera
            }
        ];

        // 2. Verificación anticipada de identidad (Usuario existente vs Nuevo Usuario)
        const docNormalizado = (datos.documento || "").toString().trim();
        const tipoDocNormalizado = (datos.tipoDocumento || "CC").toString().trim().toUpperCase();

        let usuarioFinal = null;
        let esUsuarioNuevo = false;

        const usuarioExistente = await UsuarioRepository.obtenerPorDocumento(
            docNormalizado,
            tipoDocNormalizado
        );

        if (usuarioExistente) {
            const conductorDeUsuario = await ConductorRepository.obtenerPorUsuario(usuarioExistente._id);
            if (conductorDeUsuario) {
                throw new AppError("Este usuario ya se encuentra registrado con un perfil de Conductor en la plataforma.", 409);
            }
            usuarioFinal = usuarioExistente;
        } else {
            esUsuarioNuevo = true;
            usuarioFinal = await UsuarioHelper.crear(
                {
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    nombreCompleto: datos.nombreCompleto,
                    tipoDocumento: tipoDocNormalizado,
                    documento: docNormalizado,
                    correo: datos.correo,
                    telefono: datos.telefono,
                    fechaNacimiento: datos.fechaNacimiento,
                    edad: datos.edad
                },
                "CONDUCTOR"
            );

            try {
                const nombreParaCorreo =
                    `${usuarioFinal.nombre || ""} ${usuarioFinal.apellido || ""}`.trim() ||
                    usuarioFinal.nombreCompleto ||
                    "Conductor";

                if (usuarioFinal.activationToken) {
                    await EmailService.enviarCorreoActivacion(
                        usuarioFinal.correo,
                        nombreParaCorreo,
                        usuarioFinal.activationToken,
                        "mobile",
                        "CONDUCTOR"
                    );
                }
            } catch (mailErr) {
                console.error("[ConductorService] Error al despachar correo de activación:", mailErr.message);
            }
        }

        // 3. Crear el registro del Conductor
        try {
            const conductor = await ConductorRepository.crear({
                usuario: usuarioFinal._id,
                licencia: licenciaPrincipal,
                categoriaLicencia: categoriaPrincipal,
                categoriasLicencia: categoriasList,
                categoriasDetalle,
                lugarExpedicion,
                fechaExpedicion: fechaExpedicionPrincipal,
                fechaVencimiento: fechaVencimientoPrincipal,
                licencias: licenciasProcesadas,
                experiencia: datos.experiencia !== undefined && datos.experiencia !== null ? Number(datos.experiencia) : 0,
                disponible: false,
                estadoConductor: "ACTIVO",
                estado: true,
                fotoLicencia: fotoFrontal,
                fotoLicenciaFrontal: fotoFrontal,
                fotoLicenciaTrasera: fotoTrasera,
                fotoPerfil: datos.fotoPerfil || null
            });

            return await ConductorRepository.obtenerPorId(conductor._id);
        } catch (error) {
            if (esUsuarioNuevo && usuarioFinal?._id) {
                await UsuarioRepository.eliminarFisico(usuarioFinal._id);
            }
            throw error;
        }
    }

    async obtenerTodos(filtro = {}) {
        return await ConductorRepository.obtenerTodos(filtro);
    }

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El ID del conductor no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorId(id);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        return conductor;
    }

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El ID del conductor no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorId(id);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        // 1. Actualizar datos personales en el modelo Usuario asociado
        const datosUsuario = {};
        if (datos.nombre !== undefined) datosUsuario.nombre = datos.nombre;
        if (datos.apellido !== undefined) datosUsuario.apellido = datos.apellido;
        if (datos.nombreCompleto !== undefined) datosUsuario.nombreCompleto = datos.nombreCompleto;
        if (datos.telefono !== undefined) datosUsuario.telefono = datos.telefono;
        if (datos.correo !== undefined) datosUsuario.correo = datos.correo;
        if (datos.fechaNacimiento !== undefined) datosUsuario.fechaNacimiento = datos.fechaNacimiento;
        if (datos.edad !== undefined) datosUsuario.edad = datos.edad;

        if (Object.keys(datosUsuario).length > 0 && conductor.usuario?._id) {
            await UsuarioHelper.actualizar(conductor.usuario._id, datosUsuario);
        }

        const datosConductor = {};

        // 2. Procesar licencia única en actualización
        if (Array.isArray(datos.licencias) && datos.licencias.length > 0) {
            if (datos.licencias.length > 1) {
                throw new AppError("Un conductor solo puede tener una licencia de conducción registrada.", 400);
            }

            const item = datos.licencias[0];
            const num = (item.numero || item.licencia || "").toString().trim().toUpperCase();
            if (num) {
                const existeEnDb = await ConductorRepository.obtenerPorLicencia(num);
                if (existeEnDb && existeEnDb._id.toString() !== id.toString()) {
                    throw new AppError(`La licencia '${num}' ya se encuentra registrada para otro conductor.`, 409);
                }

                const categoriasDetalle = procesarCategoriasDetalle(
                    item,
                    item.fechaExpedicion || datos.fechaExpedicion,
                    item.fechaVencimiento || datos.fechaVencimiento
                );
                const cats = categoriasDetalle.map((c) => c.categoria);
                const fotoFrontal = item.fotoLicenciaFrontal !== undefined
                    ? item.fotoLicenciaFrontal
                    : (item.fotoLicencia !== undefined ? item.fotoLicencia : conductor.fotoLicenciaFrontal || conductor.fotoLicencia || null);
                const fotoTrasera = item.fotoLicenciaTrasera !== undefined
                    ? item.fotoLicenciaTrasera
                    : (conductor.fotoLicenciaTrasera || null);
                const lugarExp = (item.lugarExpedicion || datos.lugarExpedicion || "").toString().trim();

                const licProcesada = {
                    numero: num,
                    categoria: cats[0] || "B1",
                    categorias: cats,
                    categoriasDetalle,
                    fechaExpedicion: categoriasDetalle[0]?.fechaExpedicion || (item.fechaExpedicion ? new Date(item.fechaExpedicion) : null),
                    fechaVencimiento: categoriasDetalle[0]?.fechaVencimiento || (item.fechaVencimiento ? new Date(item.fechaVencimiento) : null),
                    lugarExpedicion: lugarExp,
                    fotoLicencia: fotoFrontal,
                    fotoLicenciaFrontal: fotoFrontal,
                    fotoLicenciaTrasera: fotoTrasera
                };

                datosConductor.licencias = [licProcesada];
                datosConductor.licencia = licProcesada.numero;
                datosConductor.categoriaLicencia = licProcesada.categoria;
                datosConductor.categoriasLicencia = licProcesada.categorias;
                datosConductor.categoriasDetalle = licProcesada.categoriasDetalle;
                datosConductor.lugarExpedicion = lugarExp;
                if (licProcesada.fechaExpedicion) datosConductor.fechaExpedicion = licProcesada.fechaExpedicion;
                if (licProcesada.fechaVencimiento) datosConductor.fechaVencimiento = licProcesada.fechaVencimiento;
                datosConductor.fotoLicencia = fotoFrontal;
                datosConductor.fotoLicenciaFrontal = fotoFrontal;
                datosConductor.fotoLicenciaTrasera = fotoTrasera;
            }
        } else if (datos.licencia !== undefined) {
            const nuevaLicencia = datos.licencia.trim().toUpperCase();
            const licenciaExiste = await ConductorRepository.obtenerPorLicencia(nuevaLicencia);
            if (licenciaExiste && licenciaExiste._id.toString() !== id.toString()) {
                throw new AppError("La licencia ya se encuentra registrada para otro conductor.", 409);
            }
            datosConductor.licencia = nuevaLicencia;

            if (datos.categoriasLicencia !== undefined || datos.categoriaLicencia !== undefined) {
                let categoriasList = [];
                if (Array.isArray(datos.categoriasLicencia) && datos.categoriasLicencia.length > 0) {
                    categoriasList = datos.categoriasLicencia;
                } else if (datos.categoriaLicencia) {
                    categoriasList = [datos.categoriaLicencia];
                }
                categoriasList = [...new Set(categoriasList.map((c) => (c || "").toString().trim().toUpperCase()))].filter(Boolean);
                if (categoriasList.length > 0) {
                    datosConductor.categoriasLicencia = categoriasList;
                    datosConductor.categoriaLicencia = categoriasList[0];
                }
            }

            if (datos.fechaExpedicion !== undefined) datosConductor.fechaExpedicion = datos.fechaExpedicion;
            if (datos.fechaVencimiento !== undefined) datosConductor.fechaVencimiento = datos.fechaVencimiento;
        }

        // Experiencia en datos personales
        if (datos.experiencia !== undefined) datosConductor.experiencia = Number(datos.experiencia);
        if (datos.fotoLicencia !== undefined) datosConductor.fotoLicencia = datos.fotoLicencia;
        if (datos.fotoLicenciaFrontal !== undefined) {
            datosConductor.fotoLicenciaFrontal = datos.fotoLicenciaFrontal;
            datosConductor.fotoLicencia = datos.fotoLicenciaFrontal;
        }
        if (datos.fotoLicenciaTrasera !== undefined) datosConductor.fotoLicenciaTrasera = datos.fotoLicenciaTrasera;
        if (datos.fotoPerfil !== undefined) datosConductor.fotoPerfil = datos.fotoPerfil;

        // Validar coherencia de fechas si ambas están disponibles
        const fechaExp = datosConductor.fechaExpedicion || conductor.fechaExpedicion;
        const fechaVenc = datosConductor.fechaVencimiento || conductor.fechaVencimiento;
        if (fechaExp && fechaVenc && new Date(fechaVenc) <= new Date(fechaExp)) {
            throw new AppError("La fecha de vencimiento debe ser posterior a la fecha de expedición de la licencia.", 400);
        }

        return await ConductorRepository.actualizar(id, datosConductor);
    }

    // Control administrativo de estados (ACTIVO, INACTIVO, RETIRADO, FALLECIDO)
    async cambiarEstadoAdministrativo(id, { estadoConductor, motivo, usuarioId }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El ID del conductor no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorId(id);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        const ESTADOS_VALIDOS = ["ACTIVO", "INACTIVO", "RETIRADO", "FALLECIDO"];
        const nuevoEstado = (estadoConductor || "").toUpperCase().trim();

        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            throw new AppError(`Estado no válido. Opciones: ${ESTADOS_VALIDOS.join(", ")}`, 400);
        }

        const conductorActualizado = await ConductorRepository.cambiarEstadoAdministrativo(id, {
            estadoConductor: nuevoEstado,
            motivo,
            usuarioId
        });

        if (conductor.usuario?._id) {
            await UsuarioRepository.actualizar(conductor.usuario._id, {
                estado: nuevoEstado === "ACTIVO"
            });
        }

        return conductorActualizado;
    }

    // Disponibilidad operativa (Disponible / Fuera de servicio)
    async cambiarDisponibilidad(id, disponible) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El ID del conductor no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorId(id);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        if (disponible && conductor.estadoConductor !== "ACTIVO") {
            throw new AppError(
                `No se puede marcar como disponible a un conductor con estado administrativo '${conductor.estadoConductor}'. Debes reactivar su cuenta primero.`,
                400
            );
        }

        if (disponible && conductor.fechaVencimiento && new Date(conductor.fechaVencimiento) < new Date()) {
            throw new AppError(
                "No se puede marcar como disponible a un conductor con la licencia de conducción vencida.",
                400
            );
        }

        return await ConductorRepository.cambiarDisponibilidad(id, Boolean(disponible));
    }

    async obtenerDisponibles() {
        return await ConductorRepository.obtenerDisponibles();
    }

    async obtenerPorUsuario(usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError("El ID del usuario no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorUsuario(usuarioId);
        if (!conductor) {
            throw new AppError("No existe un conductor asociado a este usuario.", 404);
        }

        return conductor;
    }

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El ID del conductor no es válido.", 400);
        }

        const conductor = await ConductorRepository.obtenerPorId(id);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        try {
            const ServicioModel = mongoose.model("Servicio");
            const tieneServicios = await ServicioModel.findOne({ conductor: id });
            if (tieneServicios) {
                throw new AppError(
                    "No se puede eliminar permanentemente este conductor porque tiene servicios históricos registrados. Cambia su estado administrativo a 'RETIRADO' o 'INACTIVO' para preservar el historial.",
                    400
                );
            }
        } catch (e) {
            if (e.statusCode === 400) throw e;
        }

        try {
            const SolicitudModel = mongoose.model("Solicitud");
            const tieneSolicitudes = await SolicitudModel.findOne({ conductorAsignado: id });
            if (tieneSolicitudes) {
                throw new AppError(
                    "No se puede eliminar permanentemente este conductor porque cuenta con solicitudes de servicio asignadas. Cambia su estado administrativo a 'RETIRADO' o 'INACTIVO'.",
                    400
                );
            }
        } catch (e) {
            if (e.statusCode === 400) throw e;
        }

        await ConductorRepository.eliminarFisico(id);

        if (conductor.usuario?._id) {
            try {
                await UsuarioRepository.eliminarFisico(conductor.usuario._id);
            } catch (err) {
                // Ignore if referenced elsewhere
            }
        }

        return true;
    }

    async convertirACliente(conductorId, authUser) {
        const conductor = await ConductorRepository.obtenerPorId(conductorId);
        if (!conductor) {
            throw new AppError("Conductor no encontrado.", 404);
        }

        const conductorUsuarioId = conductor.usuario?._id ? conductor.usuario._id.toString() : conductor.usuario?.toString();
        const authUserId = authUser.id ? authUser.id.toString() : authUser._id?.toString();

        if (conductorUsuarioId !== authUserId && !authUser.esSuperAdmin && authUser.rol !== "ADMINISTRADOR") {
            throw new AppError("No tienes permiso para convertir esta cuenta.", 403);
        }

        // Validar si tiene servicios activos en proceso
        try {
            const Solicitud = mongoose.models.Solicitud || mongoose.model("Solicitud");
            const solicitudActiva = await Solicitud.findOne({
                conductorAsignado: conductor._id,
                estado: { $in: ["ACEPTADA", "EN_CAMINO", "LLEGADA_CONFIRMADA", "INICIADO", "EN_PROCESO"] }
            });
            if (solicitudActiva) {
                throw new AppError("No puedes cambiar a cliente mientras tengas un viaje o servicio en curso.", 400);
            }
        } catch (err) {
            if (err instanceof AppError) throw err;
        }

        // 1. Desactivar conductor
        await ConductorRepository.actualizar(conductor._id, {
            disponible: false,
            estadoConductor: "INACTIVO",
            estado: false,
            fechaCambioEstado: new Date(),
            motivoCambioEstado: "Conversión voluntaria a cuenta de cliente"
        });

        // 2. Buscar Rol CLIENTE
        let rolCliente = await RolRepository.obtenerPorNombre("CLIENTE");
        if (!rolCliente) {
            rolCliente = await RolRepository.obtenerPorNombre("CLIENTES");
        }
        if (!rolCliente) {
            const todosRoles = await RolRepository.obtenerTodos();
            rolCliente = todosRoles.find(r => r.nombre && r.nombre.toUpperCase().includes("CLIENT"));
        }
        if (!rolCliente) {
            throw new AppError("El rol CLIENTE no está configurado en el sistema.", 500);
        }

        // 3. Actualizar rol del usuario a CLIENTE
        const usuarioActualizado = await UsuarioRepository.actualizar(conductorUsuarioId, {
            rol: rolCliente._id
        });

        // 4. Crear o activar registro en la colección de clientes
        let clienteExistente = await ClienteRepository.obtenerPorUsuario(conductorUsuarioId);
        if (clienteExistente) {
            await ClienteRepository.actualizar(clienteExistente._id, { estado: true });
        } else {
            await ClienteRepository.crear({
                usuario: conductorUsuarioId,
                direccion: "",
                estado: true,
                aceptaTerminos: usuarioActualizado.aceptaTerminos ?? true
            });
        }

        // 5. Limpiar caché de autenticación del usuario
        clearAuthUserCache(conductorUsuarioId);

        // 6. Generar nuevo token con rol CLIENTE
        const nuevoToken = jwt.sign(
            {
                id: usuarioActualizado._id,
                nombre: usuarioActualizado.nombre,
                apellido: usuarioActualizado.apellido,
                correo: usuarioActualizado.correo,
                rol: "CLIENTE",
                esSuperAdmin: Boolean(usuarioActualizado.esSuperAdmin)
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN || "7d" }
        );

        return {
            token: nuevoToken,
            usuario: {
                id: usuarioActualizado._id,
                nombre: usuarioActualizado.nombre,
                apellido: usuarioActualizado.apellido,
                correo: usuarioActualizado.correo,
                telefono: usuarioActualizado.telefono,
                foto: usuarioActualizado.foto,
                rol: "CLIENTE"
            }
        };
    }
}

export default new ConductorService();
