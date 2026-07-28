import permisoService from "./permiso.service.js";

import { successResponse } from "../../responses/success.response.js";

class PermisoController {

    async crear(req, res, next) {
        try {

            const permiso = await permisoService.crear(req.body);

            return successResponse(
                res,
                permiso,
                "Permiso creado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {

            const permisos = await permisoService.obtenerTodos();

            return successResponse(
                res,
                permisos,
                "Permisos obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {

            const permiso = await permisoService.obtenerPorId(
                req.params.id
            );

            return successResponse(
                res,
                permiso,
                "Permiso obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {

            const permiso = await permisoService.actualizar(
                req.params.id,
                req.body
            );

            return successResponse(
                res,
                permiso,
                "Permiso actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {

            await permisoService.eliminar(
                req.params.id
            );

            return successResponse(
                res,
                null,
                "Permiso eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new PermisoController();