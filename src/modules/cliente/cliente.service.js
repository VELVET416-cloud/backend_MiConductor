import mongoose from "mongoose";

import ClienteRepository from "./cliente.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import AppError from "../../utils/AppError.js";

class ClienteService {

    // Crear cliente
    async crear(datos) {

        // Normalizar
        datos.direccion = datos.direccion.trim();

        // Validar id usuario
        if (!mongoose.Types.ObjectId.isValid(datos.usuario)) {
            throw new AppError(
                "El usuario enviado no es válido.",
                400
            );
        }

        // Validar existencia del usuario
        const usuario = await UsuarioRepository.obtenerPorId(
            datos.usuario
        );

        if (!usuario) {
            throw new AppError(
                "El usuario no existe.",
                404
            );
        }

        // Validar que no exista otro cliente con ese usuario
        const clienteExiste =
            await ClienteRepository.obtenerPorUsuario(
                datos.usuario
            );

        if (clienteExiste) {
            throw new AppError(
                "El usuario ya está registrado como cliente.",
                409
            );
        }

        return await ClienteRepository.crear(datos);
    }

    // Obtener todos
    async obtenerTodos() {

        return await ClienteRepository.obtenerTodos();

    }

    // Obtener por id
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

    // Actualizar
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
            datos.direccion = datos.direccion.trim();
        }

        return await ClienteRepository.actualizar(
            id,
            datos
        );

    }

    // Eliminar
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

        return;

    }

}

export default new ClienteService();