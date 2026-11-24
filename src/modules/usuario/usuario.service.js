import mongoose from "mongoose";

import UsuarioRepository from "./usuario.repository.js";
import UsuarioHelper from "./usuario.helper.js";
import AppError from "../../utils/AppError.js";

class UsuarioService {

    // Crear usuario
    async crear(datos) {

        return await UsuarioHelper.crear(datos);

    }

    // Obtener todos
    async obtenerTodos() {

        return await UsuarioRepository.obtenerTodos();

    }

    // Obtener por ID
    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {
            throw new AppError(
                "Usuario no encontrado.",
                404
            );
        }

        return usuario;

    }

    // Actualizar usuario
    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        return await UsuarioHelper.actualizar(
            id,
            datos
        );

    }

    // Eliminar usuario
    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del usuario no es válido.",
                400
            );
        }

        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {
            throw new AppError(
                "Usuario no encontrado.",
                404
            );
        }

        await UsuarioHelper.eliminar(id);

    }

}

export default new UsuarioService();