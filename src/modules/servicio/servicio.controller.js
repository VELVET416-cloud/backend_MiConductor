import ServicioService from "./servicio.service.js";
import { successResponse } from "../../responses/success.response.js";

class ServicioController {

    // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos(req, res, next) {
        try {

            const servicios =
                await ServicioService.obtenerTodos();

            return successResponse(
                res,
                servicios,
                "Servicios obtenidos correctamente."
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

            const servicio =
                await ServicioService.obtenerPorId(id);

            return successResponse(
                res,
                servicio,
                "Servicio obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // OBTENER POR SOLICITUD
    // ======================================================

    async obtenerPorSolicitud(req, res, next) {
        try {

            const { solicitudId } = req.params;

            const servicio =
                await ServicioService.obtenerPorSolicitud(
                    solicitudId
                );

            return successResponse(
                res,
                servicio,
                "Servicio obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // AGREGAR IMAGENES
    // ======================================================

    async agregarImagenes(req, res, next) {
        try {

            const { id } = req.params;
            const { imagenes, urls, tipo } = req.body;

            const listaImagenes = imagenes || urls || [];

            const servicio =
                await ServicioService.agregarImagenes(id, {
                    imagenes: listaImagenes,
                    tipo
                });

            return successResponse(
                res,
                servicio,
                "Imágenes agregadas correctamente al servicio."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new ServicioController();