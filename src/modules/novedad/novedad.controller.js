import NovedadService from "./novedad.service.js";
import { successResponse } from "../../responses/success.response.js";

class NovedadController {

    // ======================================================
    // CREAR NOVEDAD
    // ======================================================

    async crear(req, res, next) {
        try {

            const novedad = await NovedadService.crear(
                req.body
            );

            return successResponse(
                res,
                novedad,
                "Novedad registrada correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER TODAS LAS NOVEDADES
    // ======================================================

    async obtenerTodos(req, res, next) {
        try {

            const novedades = await NovedadService.obtenerTodos();

            return successResponse(
                res,
                novedades,
                "Novedades obtenidas correctamente."
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

            const novedad = await NovedadService.obtenerPorId(id);

            return successResponse(
                res,
                novedad,
                "Novedad obtenida correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER NOVEDADES POR SOLICITUD
    // ======================================================

    async obtenerPorSolicitud(req, res, next) {
        try {

            const { solicitudId } = req.params;

            const novedades = await NovedadService.obtenerPorSolicitud(
                solicitudId
            );

            return successResponse(
                res,
                novedades,
                "Novedades de la solicitud obtenidas correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER NOVEDADES POR CONDUCTOR
    // ======================================================

    async obtenerPorConductor(req, res, next) {
        try {

            const { conductorId } = req.params;

            const novedades = await NovedadService.obtenerPorConductor(
                conductorId
            );

            return successResponse(
                res,
                novedades,
                "Novedades del conductor obtenidas correctamente."
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

            const novedad = await NovedadService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                novedad,
                "Novedad actualizada correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // CAMBIAR ESTADO DE LA NOVEDAD
    // ======================================================

    async cambiarEstado(req, res, next) {
        try {

            const { id } = req.params;
            const { estadoNovedad, observaciones } = req.body;

            const novedad = await NovedadService.cambiarEstado(
                id,
                estadoNovedad,
                observaciones
            );

            return successResponse(
                res,
                novedad,
                "Estado de la novedad actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminar(req, res, next) {
        try {

            const { id } = req.params;

            await NovedadService.eliminar(id);

            return successResponse(
                res,
                null,
                "Novedad eliminada correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new NovedadController();
