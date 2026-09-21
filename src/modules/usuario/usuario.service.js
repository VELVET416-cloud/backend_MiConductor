import mongoose from "mongoose";

import UsuarioRepository from "./usuario.repository.js";
import UsuarioHelper from "./usuario.helper.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import AppError from "../../utils/AppError.js";

class UsuarioService {

    // Crear usuario
    async crear(datos) {

        return await UsuarioHelper.crear(datos);

    }

    // Obtener todos los usuarios
    async obtenerTodos() {

        return await UsuarioRepository.obtenerTodos();

    }

    // Obtener usuario por ID
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

    // Eliminar usuario DEFINITIVAMENTE
    async eliminar(id) {

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del usuario no es válido.",
                400
            );

        }

        // Verificar que el usuario exista
        const usuario = await UsuarioRepository.obtenerPorId(id);

        if (!usuario) {

            throw new AppError(
                "Usuario no encontrado.",
                404
            );

        }

        // Buscar y eliminar el conductor relacionado
        // mediante el campo conductor.usuario
        await ConductorRepository.eliminarPorUsuario(id);

        // Eliminar definitivamente el usuario
        const usuarioEliminado =
            await UsuarioRepository.eliminar(id);

        if (!usuarioEliminado) {

            throw new AppError(
                "No se pudo eliminar el usuario.",
                500
            );

        }

        return usuarioEliminado;

    }

}

export default new UsuarioService();