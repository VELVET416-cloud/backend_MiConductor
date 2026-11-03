import mongoose from "mongoose";

import ClienteRepository from "./cliente.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import AppError from "../../utils/AppError.js";
import RolRepository from "../rol/rol.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import EmailService from "../auth/email.service.js";

class ClienteService {

    // ======================================================
    // CREAR CLIENTE
    // ======================================================

    async crear(datos) {

        datos.direccion = datos.direccion.trim();

        // Si no se proporcionó contraseña, se asigna el número de documento como contraseña inicial
        if (!datos.password || !datos.password.trim()) {
            datos.password = datos.documento ? datos.documento.trim() : "";
        }

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

        // Crear usuario con rol CLIENTE
        const usuario = await UsuarioHelper.crear({
            nombre: datos.nombre,
            apellido: datos.apellido,
            tipoDocumento: datos.tipoDocumento,
            documento: datos.documento,
            correo: datos.correo,
            password: datos.password,
            telefono: datos.telefono,
            rol: rolClienteId
        });

        try {

            // Crear registro de Cliente con referencia al usuario creado
            const cliente = await ClienteRepository.crear({
                usuario: usuario._id,
                direccion: datos.direccion
            });

            const clienteCompleto = await ClienteRepository.obtenerPorId(cliente._id);

            // Enviar correo de bienvenida con credenciales
            try {
                const info = await EmailService.enviarBienvenida({
                    correo: datos.correo,
                    nombre: `${datos.nombre} ${datos.apellido}`.trim(),
                    usuario: datos.correo,
                    clave: datos.password,
                });
                console.log(`[EmailService] ✓ Correo de bienvenida enviado a ${datos.correo} (ID: ${info?.messageId})`);
            } catch (mailErr) {
                // El correo es de mejor esfuerzo — no interrumpe el registro
                console.error(`[EmailService] ✗ No se pudo enviar correo de bienvenida a ${datos.correo}:`, mailErr.message);
            }

            return clienteCompleto;

        } catch (error) {

            // Si falla la creación del cliente,
            // eliminar el usuario que acabamos de crear
            await UsuarioHelper.eliminar(
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
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del cliente no es válido.",
                400
            );

        }

        const cliente =
            await ClienteRepository.obtenerPorId(id);

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

        const cliente =
            await ClienteRepository.obtenerPorId(id);

        if (!cliente) {

            throw new AppError(
                "Cliente no encontrado.",
                404
            );

        }

        if (datos.direccion) {

            datos.direccion =
                datos.direccion.trim();

        }

        return await ClienteRepository.actualizar(
            id,
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

        const cliente =
            await ClienteRepository.obtenerPorId(id);

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