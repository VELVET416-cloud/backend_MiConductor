import SolicitudService from "./solicitud.service.js";
import { successResponse } from "../../responses/success.response.js";

class SolicitudController {

    // ======================================================
    // CREAR SOLICITUD
    // ======================================================

    async crear(req, res, next) {
        try {

            const solicitud = await SolicitudService.crear(
                req.body
            );

            return successResponse(
                res,
                solicitud,
                "Solicitud creada correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos(req, res, next) {
        try {

            const solicitudes =
                await SolicitudService.obtenerTodos();

            return successResponse(
                res,
                solicitudes,
                "Solicitudes obtenidas correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(req, res, next) {
        try {

            const { id } = req.params;

            const solicitud =
                await SolicitudService.obtenerPorId(id);

            return successResponse(
                res,
                solicitud,
                "Solicitud obtenida correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(req, res, next) {
        try {

            const { id } = req.params;

            const solicitud = await SolicitudService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                solicitud,
                "Solicitud actualizada correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // ASIGNAR CONDUCTOR
    // ======================================================

    async asignarConductor(req, res, next) {
        try {

            const { id } = req.params;
            const { conductorAsignado } = req.body;

            const solicitud =
                await SolicitudService.asignarConductor(
                    id,
                    conductorAsignado
                );

            return successResponse(
                res,
                solicitud,
                "Conductor asignado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new SolicitudController();