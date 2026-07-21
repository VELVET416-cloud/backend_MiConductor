import rolService from "./rol.service.js";

import { successResponse } from "../../responses/success.response.js";

class RolController {

    async crear(req, res, next) {
        try {

            const rol = await rolService.crear(req.body);

            return successResponse(
                res,
                rol,
                "Rol creado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {

            const roles = await rolService.obtenerTodos();

            return successResponse(
                res,
                roles,
                "Roles obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {

            const rol = await rolService.obtenerPorId(
                req.params.id
            );

            return successResponse(
                res,
                rol,
                "Rol obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {

            const rol = await rolService.actualizar(
                req.params.id,
                req.body
            );

            return successResponse(
                res,
                rol,
                "Rol actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {

            await rolService.eliminar(
                req.params.id
            );

            return successResponse(
                res,
                null,
                "Rol eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new RolController();