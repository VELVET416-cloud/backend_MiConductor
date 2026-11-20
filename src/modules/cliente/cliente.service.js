import EmailService from "../auth/email.service.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { env } from "../../config/env.js";

import ClienteRepository from "./cliente.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import AppError from "../../utils/AppError.js";
import RolRepository from "../rol/rol.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";

class ClienteService {

    // ======================================================
    // CREAR CLIENTE
    // ======================================================

    async crear(datos) {
        datos.direccion = datos.direccion.trim();

        // Buscar el rol CLIENTE
        let rolClienteId = datos.rol || datos.rolId;

        if (!rolClienteId) {
            let rolCliente = await RolRepository.obtenerPorNombre("CLIENTE");
            if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("CLIENTES");
            if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("Cliente");

            if (!rolCliente) {
                throw new AppError(
                    "El rol CLIENTE no está configurado.",
                    500
                );
            }
            rolClienteId = rolCliente._id;
        }

        // No enviamos password fijo para que UsuarioHelper genere activationToken
        // y el cliente pueda crear su propia contraseña desde el correo de activación.
        const usuario = await UsuarioHelper.crear({
            nombre: datos.nombre,
            apellido: datos.apellido,
            nombreCompleto: datos.nombreCompleto || `${datos.nombre || ""} ${datos.apellido || ""}`.trim(),
            tipoDocumento: datos.tipoDocumento,
            documento: datos.documento,
            correo: datos.correo,
            telefono: datos.telefono,
            foto: datos.foto || null,
            fechaNacimiento: datos.fechaNacimiento || null,
            edad: datos.edad || null,
            rol: rolClienteId
        });

        try {
            // Crear registro de Cliente con referencia al usuario creado
            const cliente = await ClienteRepository.crear({
                usuario: usuario._id,
                direccion: datos.direccion,
                foto: datos.foto || null,
                fechaNacimiento: datos.fechaNacimiento || null,
                edad: datos.edad || null
            });

            // Recargar variables de entorno de correo por si el servidor inició antes de actualizar .env
            dotenv.config({ override: true });
            if (process.env.MAIL_USER) env.MAIL_USER = process.env.MAIL_USER;
            if (process.env.MAIL_PASSWORD) env.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
            if (process.env.MAIL_HOST) env.MAIL_HOST = process.env.MAIL_HOST;
            if (process.env.MAIL_PORT) env.MAIL_PORT = process.env.MAIL_PORT;
            if (process.env.CLIENT_URL) env.CLIENT_URL = process.env.CLIENT_URL;

            // Apuntar el enlace de activación del cliente a /api/clientes/activar-cuenta
            // para que funcione directamente en el navegador aunque el Administrador tenga sesión abierta.
            const port = process.env.PORT || env.PORT || 3000;
            env.MOBILE_CLIENT_URL = `http://localhost:${port}/api/clientes`;

            // Enviar correo de activación al cliente para que cree y guarde su contraseña
            try {
                const nombreParaCorreo =
                    `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() ||
                    datos.nombreCompleto ||
                    "Cliente";

                if (usuario.activationToken) {
                    await EmailService.enviarCorreoActivacion(
                        usuario.correo,
                        nombreParaCorreo,
                        usuario.activationToken,
                        "mobile"
                    );
                }
            } catch (mailErr) {
                console.error("[ClienteService] Error enviando correo de activación:", mailErr.message);
            }

            const clienteCompleto = await ClienteRepository.obtenerPorId(cliente._id);

            return clienteCompleto;

        } catch (error) {
            // Si falla la creación del cliente, eliminar el usuario que acabamos de crear
            await UsuarioHelper.eliminarFisico(
                usuario._id
            );

            throw error;
        }
    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos(page, limit, search, estado) {
        return await ClienteRepository.obtenerTodos(page, limit, search, estado);
    }

    // ======================================================
    // OBTENER LISTA (SIN PAGINAR)
    // ======================================================

    async obtenerLista() {
        return await ClienteRepository.obtenerLista();
    }

    // ======================================================
    // OBTENER POR USUARIO
    // ======================================================

    async obtenerPorUsuario(usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorUsuario(usuarioId);

        if (!cliente) {
            const usuarioExiste = await UsuarioRepository.obtenerPorId(usuarioId);
            if (usuarioExiste) {
                const creado = await ClienteRepository.crear({
                    usuario: usuarioExiste._id,
                    direccion: "Sin dirección registrada",
                    foto: usuarioExiste.foto || null
                });
                cliente = await ClienteRepository.obtenerPorId(creado._id);
            }
        }

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado para este usuario.",
                404
            );
        }

        return cliente;
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(id);
        }

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        return cliente;
    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(id);
        }

        if (!cliente) {
            const usuarioExiste = await UsuarioRepository.obtenerPorId(id);
            if (usuarioExiste) {
                const creado = await ClienteRepository.crear({
                    usuario: usuarioExiste._id,
                    direccion: datos.direccion ? datos.direccion.trim() : "Sin dirección registrada",
                    foto: datos.foto || null
                });
                cliente = await ClienteRepository.obtenerPorId(creado._id);
            }
        }

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        if (datos.direccion) {
            datos.direccion = datos.direccion.trim();
        }

        // Sincronizar foto y datos con el Usuario vinculado si existen
        if (cliente.usuario) {
            const usuarioId = cliente.usuario._id || cliente.usuario;
            const usuarioUpdates = {};
            if (datos.foto !== undefined) usuarioUpdates.foto = datos.foto;
            if (datos.nombre) usuarioUpdates.nombre = datos.nombre;
            if (datos.apellido) usuarioUpdates.apellido = datos.apellido;
            if (datos.telefono) usuarioUpdates.telefono = datos.telefono;
            if (datos.correo) usuarioUpdates.correo = datos.correo;
            if (datos.tipoDocumento) usuarioUpdates.tipoDocumento = datos.tipoDocumento;
            if (datos.documento) usuarioUpdates.documento = datos.documento;
            if (datos.fechaNacimiento) usuarioUpdates.fechaNacimiento = datos.fechaNacimiento;
            if (datos.edad !== undefined) usuarioUpdates.edad = datos.edad;

            if (Object.keys(usuarioUpdates).length > 0) {
                try {
                    await UsuarioHelper.actualizar(usuarioId, usuarioUpdates);
                } catch (uErr) {
                    console.warn("[ClienteService] Advertencia sincronizando usuario vinculado:", uErr.message);
                }
            }
        }

        return await ClienteRepository.actualizar(
            cliente._id,
            datos
        );
    }

    // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        const cliente = await ClienteRepository.obtenerPorId(id);

        if (!cliente) {
            throw new AppError(
                "Cliente no encontrado.",
                404
            );
        }

        const vehiculos = await VehiculoRepository.obtenerPorCliente(id);
        const solicitudes = await SolicitudRepository.obtenerPorCliente(id);

        if ((vehiculos && vehiculos.length > 0) || (solicitudes && solicitudes.length > 0)) {
            // Desactivar en lugar de eliminar
            await ClienteRepository.eliminar(id);
            if (cliente.usuario && cliente.usuario._id) {
                await UsuarioHelper.eliminar(cliente.usuario._id);
            }
            
            let msg = "El cliente tiene ";
            if (vehiculos && vehiculos.length > 0) msg += "vehículos asociados";
            if (solicitudes && solicitudes.length > 0) {
                if (vehiculos && vehiculos.length > 0) msg += " y ";
                msg += "solicitudes de servicio registradas";
            }
            throw new AppError(msg + ". Por lo tanto, ha sido desactivado en lugar de eliminado.", 400);
        }

        // Eliminación física
        await ClienteRepository.eliminarFisico(id);

        if (cliente.usuario && cliente.usuario._id) {
            await UsuarioHelper.eliminarFisico(
                cliente.usuario._id
            );
        }

        return;

    }

    // ======================================================
    // VERIFICAR DOCUMENTO / CÉDULA
    // ======================================================

    async verificarDocumento(documento) {
        if (!documento || !documento.trim()) {
            throw new AppError("El documento es obligatorio para realizar la verificación.", 400);
        }

        const doc = documento.trim();
        const usuarioExistente = await UsuarioRepository.obtenerPorDocumento(doc);

        if (usuarioExistente) {
            return {
                disponible: false,
                existe: true,
                mensaje: "Ya existe un usuario registrado con este documento de identidad.",
                usuario: {
                    _id: usuarioExistente._id,
                    nombre: `${usuarioExistente.nombre || ''} ${usuarioExistente.apellido || ''}`.trim(),
                    correo: usuarioExistente.correo,
                    documento: usuarioExistente.documento
                }
            };
        }

        return {
            disponible: true,
            existe: false,
            mensaje: "El documento está disponible para registro."
        };
    }

}

export default new ClienteService();
