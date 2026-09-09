import mongoose from "mongoose";

import ClienteRepository from "./cliente.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import AppError from "../../utils/AppError.js";
import RolRepository from "../rol/rol.repository.js";

class ClienteService {

    // ======================================================
    // CREAR CLIENTE
    // ======================================================

    async crear(datos) {

        datos.direccion = datos.direccion.trim();

        // Buscar el rol CLIENTE
        const rolCliente = await RolRepository.obtenerPorNombre("CLIENTE");

        if (!rolCliente) {
            throw new AppError(
                "El rol CLIENTE no está configurado.",
                500
            );
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
            rol: rolCliente._id
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

    async obtenerTodos() {

        return await ClienteRepository.obtenerTodos();

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

        await ClienteRepository.eliminar(id);

        await UsuarioHelper.eliminar(
            cliente.usuario._id
        );

        return;

    }

}

export default new ClienteService();