import mongoose from "mongoose";
import ConductorRepository from "./conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import EmailService from "../auth/email.service.js";
import AppError from "../../utils/AppError.js";

const CATEGORIAS_VALIDAS_COLOMBIA = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];

class ConductorService {
    async crear(datos) {
        // 1. Procesar licencias múltiples (si se envía array licencias, o campos individuales)
        let licenciasProcesadas = [];
        if (Array.isArray(datos.licencias) && datos.licencias.length > 0) {
            const numerosVistos = new Set();
            for (let i = 0; i < datos.licencias.length; i++) {
                const item = datos.licencias[i];
                const num = (item.numero || item.licencia || "").toString().trim().toUpperCase();
                if (!num) continue;
                if (numerosVistos.has(num)) {
                    throw new AppError(`La licencia #${i + 1} (${num}) está repetida. Cada licencia debe tener un número único.`, 400);
                }
                numerosVistos.add(num);

                // Comprobar si ya existe en la base de datos
                const existeEnDb = await ConductorRepository.obtenerPorLicencia(num);
                if (existeEnDb) {
                    throw new AppError(`La licencia '${num}' ya se encuentra registrada en el sistema para otro conductor.`, 409);
                }

                // Categorías de esta licencia
                let cats = [];
                if (Array.isArray(item.categorias) && item.categorias.length > 0) cats = item.categorias;
                else if (Array.isArray(item.categoriasLicencia) && item.categoriasLicencia.length > 0) cats = item.categoriasLicencia;
                else if (item.categoria) cats = [item.categoria];
                cats = [...new Set(cats.map((c) => (c || "").toString().trim().toUpperCase()))].filter(Boolean);

                for (const cat of cats) {
                    if (!CATEGORIAS_VALIDAS_COLOMBIA.includes(cat)) {
                        throw new AppError(`La categoría de licencia '${cat}' en la licencia #${i + 1} no es válida en Colombia.`, 400);
                    }
                }

                if (cats.length === 0) cats = ["B1"];

                if (item.fechaExpedicion && item.fechaVencimiento) {
                    const exp = new Date(item.fechaExpedicion);
                    const venc = new Date(item.fechaVencimiento);
                    if (venc <= exp) {
                        throw new AppError(`En la licencia #${i + 1} (${num}), la fecha de vencimiento debe ser posterior a la fecha de expedición.`, 400);
                    }
                }

                licenciasProcesadas.push({
                    numero: num,
                    categoria: cats[0] || "B1",
                    categorias: cats,
                    fechaExpedicion: item.fechaExpedicion ? new Date(item.fechaExpedicion) : null,
                    fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : null,
                    lugarExpedicion: (item.lugarExpedicion || "").toString().trim(),
                    fotoLicencia: item.fotoLicencia || null
                });
            }
        }

        // Si no se pasaron licencias múltiples, tomar campos directos
        let licenciaPrincipal = datos.licencia?.trim()?.toUpperCase();
        if (!licenciaPrincipal && licenciasProcesadas.length > 0) {
            licenciaPrincipal = licenciasProcesadas[0].numero;
        }

        if (!licenciaPrincipal) {
            throw new AppError("Debes registrar al menos una licencia de conducción.", 400);
        }

        // Validar si la licencia principal existe
        const licenciaExiste = await ConductorRepository.obtenerPorLicencia(licenciaPrincipal);
        if (licenciaExiste) {
            throw new AppError(`La licencia '${licenciaPrincipal}' ya se encuentra registrada en el sistema.`, 409);
        }

        // Categorías generales
        let categoriasList = [];
        if (Array.isArray(datos.categoriasLicencia) && datos.categoriasLicencia.length > 0) {
            categoriasList = datos.categoriasLicencia;
        } else if (licenciasProcesadas.length > 0) {
            categoriasList = licenciasProcesadas[0].categorias;
        } else if (datos.categoriaLicencia) {
            categoriasList = [datos.categoriaLicencia];
        }

        categoriasList = [...new Set(categoriasList.map((c) => (c || "").toString().trim().toUpperCase()))].filter(Boolean);
        if (categoriasList.length === 0) categoriasList = ["B1"];

        const categoriaPrincipal = categoriasList[0];

        const fechaExpedicionPrincipal = datos.fechaExpedicion || licenciasProcesadas[0]?.fechaExpedicion;
        const fechaVencimientoPrincipal = datos.fechaVencimiento || licenciasProcesadas[0]?.fechaVencimiento;

        if (!fechaExpedicionPrincipal || !fechaVencimientoPrincipal) {
            throw new AppError("Las fechas de expedición y vencimiento de la licencia son obligatorias.", 400);
        }

        if (new Date(fechaVencimientoPrincipal) <= new Date(fechaExpedicionPrincipal)) {
            throw new AppError("La fecha de vencimiento debe ser posterior a la fecha de expedición de la licencia.", 400);
        }

        // Asegurar que licenciasProcesadas tenga al menos la licencia principal
        if (licenciasProcesadas.length === 0) {
            licenciasProcesadas.push({
                numero: licenciaPrincipal,
                categoria: categoriaPrincipal,
                categorias: categoriasList,
                fechaExpedicion: fechaExpedicionPrincipal,
                fechaVencimiento: fechaVencimientoPrincipal,
                lugarExpedicion: (datos.lugarExpedicion || "").toString().trim(),
                fotoLicencia: datos.fotoLicencia || null
            });
        }

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
                        usuarioFinal.activationToken
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
                fechaExpedicion: fechaExpedicionPrincipal,
                fechaVencimiento: fechaVencimientoPrincipal,
                licencias: licenciasProcesadas,
                experiencia: datos.experiencia !== undefined && datos.experiencia !== null ? Number(datos.experiencia) : 0,
                disponible: false,
                estadoConductor: "ACTIVO",
                estado: true,
                fotoLicencia: datos.fotoLicencia || licenciasProcesadas[0]?.fotoLicencia || null,
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

        // 2. Procesar licencias múltiples en actualización
        if (Array.isArray(datos.licencias) && datos.licencias.length > 0) {
            const licenciasProcesadas = [];
            const numerosVistos = new Set();

            for (let i = 0; i < datos.licencias.length; i++) {
                const item = datos.licencias[i];
                const num = (item.numero || item.licencia || "").toString().trim().toUpperCase();
                if (!num) continue;
                if (numerosVistos.has(num)) {
                    throw new AppError(`La licencia #${i + 1} (${num}) está duplicada.`, 400);
                }
                numerosVistos.add(num);

                // Comprobar si pertenece a otro conductor
                const existeEnDb = await ConductorRepository.obtenerPorLicencia(num);
                if (existeEnDb && existeEnDb._id.toString() !== id.toString()) {
                    throw new AppError(`La licencia '${num}' ya se encuentra registrada para otro conductor.`, 409);
                }

                let cats = [];
                if (Array.isArray(item.categorias) && item.categorias.length > 0) cats = item.categorias;
                else if (Array.isArray(item.categoriasLicencia) && item.categoriasLicencia.length > 0) cats = item.categoriasLicencia;
                else if (item.categoria) cats = [item.categoria];
                cats = [...new Set(cats.map((c) => (c || "").toString().trim().toUpperCase()))].filter(Boolean);
                if (cats.length === 0) cats = ["B1"];

                if (item.fechaExpedicion && item.fechaVencimiento) {
                    if (new Date(item.fechaVencimiento) <= new Date(item.fechaExpedicion)) {
                        throw new AppError(`En la licencia #${i + 1} (${num}), la fecha de vencimiento debe ser posterior a la de expedición.`, 400);
                    }
                }

                licenciasProcesadas.push({
                    numero: num,
                    categoria: cats[0] || "B1",
                    categorias: cats,
                    fechaExpedicion: item.fechaExpedicion ? new Date(item.fechaExpedicion) : null,
                    fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : null,
                    lugarExpedicion: (item.lugarExpedicion || "").toString().trim(),
                    fotoLicencia: item.fotoLicencia || null
                });
            }

            if (licenciasProcesadas.length > 0) {
                datosConductor.licencias = licenciasProcesadas;
                datosConductor.licencia = licenciasProcesadas[0].numero;
                datosConductor.categoriaLicencia = licenciasProcesadas[0].categoria;
                datosConductor.categoriasLicencia = licenciasProcesadas[0].categorias;
                if (licenciasProcesadas[0].fechaExpedicion) datosConductor.fechaExpedicion = licenciasProcesadas[0].fechaExpedicion;
                if (licenciasProcesadas[0].fechaVencimiento) datosConductor.fechaVencimiento = licenciasProcesadas[0].fechaVencimiento;
                if (licenciasProcesadas[0].fotoLicencia) datosConductor.fotoLicencia = licenciasProcesadas[0].fotoLicencia;
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
}

export default new ConductorService();
