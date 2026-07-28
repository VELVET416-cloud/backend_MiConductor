import mongoose from "mongoose";

import ClienteRepository from "./cliente.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import AppError from "../../utils/AppError.js";

class ClienteService {

    // ======================================================
    // CREAR CLIENTE
    // ======================================================

    async crear(datos) {

        datos.direccion = datos.direccion.trim();

        const usuario = await UsuarioHelper.crear(
            {
                nombre: datos.nombre,
                apellido: datos.apellido,
                tipoDocumento: datos.tipoDocumento,
                documento: datos.documento,
                correo: datos.correo,
                password: datos.password,
                telefono: datos.telefono
            },
            "CLIENTE"
        );

        try {

            const cliente = await ClienteRepository.crear({

                usuario: usuario._id,
                direccion: datos.direccion

            });

            return await ClienteRepository.obtenerPorId(
                cliente._id
            );

        } catch (error) {

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