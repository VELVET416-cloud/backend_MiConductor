import UsuarioService from "./usuario.service.js";
import { successResponse } from "../../responses/success.response.js";

class UsuarioController {

    // Crear usuario
    async crear(req, res, next) {
        try {

            const usuario = await UsuarioService.crear(req.body);

            return successResponse(
                res,
                usuario,
                "Usuario creado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener todos los usuarios
    async obtenerTodos(req, res, next) {
        try {

            const usuarios = await UsuarioService.obtenerTodos();

            return successResponse(
                res,
                usuarios,
                "Usuarios obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener usuario por ID
    async obtenerPorId(req, res, next) {
        try {

            const { id } = req.params;

            const usuario = await UsuarioService.obtenerPorId(id);

            return successResponse(
                res,
                usuario,
                "Usuario obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Actualizar usuario
    async actualizar(req, res, next) {
        try {

            const { id } = req.params;

            const usuario = await UsuarioService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                usuario,
                "Usuario actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Eliminar usuario
    async eliminar(req, res, next) {
        try {

            const { id } = req.params;

            await UsuarioService.eliminar(id);

            return successResponse(
                res,
                null,
                "Usuario eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new UsuarioController();