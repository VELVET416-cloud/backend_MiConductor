import SeguimientoService from "./seguimiento.service.js";
import { successResponse } from "../../responses/success.response.js";

class SeguimientoController {

    // ======================================================
    // CREAR (INICIAR) SEGUIMIENTO
    // ======================================================

    async crear(req, res, next) {
        try {

            const { servicioId, conductorId } = req.body;

            const seguimiento = await SeguimientoService.iniciar(
                servicioId,
                conductorId
            );

            return successResponse(
                res,
                seguimiento,
                "Seguimiento iniciado correctamente.",
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

            const seguimientos =
                await SeguimientoService.obtenerTodos();

            return successResponse(
                res,
                seguimientos,
                "Seguimientos obtenidos correctamente."
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

            const seguimiento =
                await SeguimientoService.obtenerPorId(id);

            return successResponse(
                res,
                seguimiento,
                "Seguimiento obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER POR SERVICIO
    // ======================================================

    async obtenerPorServicio(req, res, next) {
        try {

            const { servicioId } = req.params;

            const seguimiento =
                await SeguimientoService.obtenerPorServicio(
                    servicioId
                );

            return successResponse(
                res,
                seguimiento,
                "Seguimiento obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER ACTIVOS
    // ======================================================

    async obtenerActivos(req, res, next) {
        try {

            const seguimientos =
                await SeguimientoService.obtenerActivos();

            return successResponse(
                res,
                seguimientos,
                "Seguimientos activos obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
// AGREGAR COORDENADA
// ======================================================

async agregarCoordenada(req, res, next) {
    try {

        const { id } = req.params;
        const { lat, lng } = req.body;

        // Obtener el seguimiento para extraer el servicio asociado
        const seguimientoExistente =
            await SeguimientoService.obtenerPorId(id);

        const servicioId = seguimientoExistente.servicio._id.toString();

        const seguimiento =
            await SeguimientoService.agregarCoordenada(
                servicioId,
                { lat, lng, timestamp: new Date() }
            );

        return successResponse(
            res,
            seguimiento,
            "Coordenada registrada correctamente."
        );

    } catch (error) {
        next(error);
    }
}

    // ======================================================
    // FINALIZAR SEGUIMIENTO
    // ======================================================

    async finalizar(req, res, next) {
        try {

            const { id } = req.params;

            const seguimiento =
                await SeguimientoService.finalizar(id);

            return successResponse(
                res,
                seguimiento,
                "Seguimiento finalizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new SeguimientoController();