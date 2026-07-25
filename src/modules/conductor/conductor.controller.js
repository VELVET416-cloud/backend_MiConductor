import ConductorService from "./conductor.service.js";
import { successResponse } from "../../responses/success.response.js";

class ConductorController {

    // Crear conductor
    async crear(req, res, next) {
        try {

            const conductor = await ConductorService.crear(
                req.body
            );

            return successResponse(
                res,
                conductor,
                "Conductor creado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener todos
    async obtenerTodos(req, res, next) {
        try {

            const conductores =
                await ConductorService.obtenerTodos();

            return successResponse(
                res,
                conductores,
                "Conductores obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener por ID
    async obtenerPorId(req, res, next) {
        try {

            const { id } = req.params;

            const conductor =
                await ConductorService.obtenerPorId(id);

            return successResponse(
                res,
                conductor,
                "Conductor obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Actualizar
    async actualizar(req, res, next) {
        try {

            const { id } = req.params;

            const conductor =
                await ConductorService.actualizar(
                    id,
                    req.body
                );

            return successResponse(
                res,
                conductor,
                "Conductor actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Eliminar
    async eliminar(req, res, next) {
        try {

            const { id } = req.params;

            await ConductorService.eliminar(id);

            return successResponse(
                res,
                null,
                "Conductor eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Cambiar disponibilidad
    async cambiarDisponibilidad(
        req,
        res,
        next
    ) {

        try {

            const { id } = req.params;

            const { disponible } = req.body;

            const conductor =
                await ConductorService.cambiarDisponibilidad(
                    id,
                    disponible
                );

            return successResponse(

                res,

                conductor,

                "Disponibilidad actualizada correctamente."

            );

        } catch (error) {

            next(error);

        }

    }

    // Obtener conductores disponibles
    async obtenerDisponibles(req, res, next) {

        try {

            const conductores =
                await ConductorService.obtenerDisponibles();

            return successResponse(
                res,
                conductores,
                "Conductores disponibles obtenidos correctamente."
            );

        } catch (error) {

            next(error);

        }

    }

    // Obtener conductor por usuario
    async obtenerPorUsuario(req, res, next) {

        try {

            const { usuarioId } = req.params;

            const conductor =
                await ConductorService.obtenerPorUsuario(usuarioId);

            return successResponse(
                res,
                conductor,
                "Conductor obtenido correctamente."
            );

        } catch (error) {

            next(error);

        }

    }

    // Actualizar licencia
    async actualizarLicencia(req, res, next) {

        try {

            const { id } = req.params;

            const conductor =
                await ConductorService.actualizarLicencia(
                    id,
                    req.body
                );

            return successResponse(
                res,
                conductor,
                "Licencia actualizada correctamente."
            );

        } catch (error) {

            next(error);

        }

    }

}

export default new ConductorController();