import mongoose from "mongoose";

import ClienteRepository from "./cliente.repository.js";
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

            return await ClienteRepository.obtenerPorId(
                cliente._id
            );

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

}

export default new ClienteService();