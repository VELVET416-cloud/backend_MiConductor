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
    // SUBIR IMÁGENES AL SERVICIO (Cloudinary multipart/form-data)
    // ======================================================

    async subirImagenes(req, res, next) {
        try {
            const { id } = req.params;
            const archivos = req.archivosProcesados || [];

            // Si se enviaron archivos multipart (Cloudinary)
            if (archivos.length > 0) {
                const servicio = await ServicioService.subirImagenes(
                    id,
                    archivos,
                    req.user
                );

                return successResponse(
                    res,
                    servicio,
                    "Imágenes subidas y asociadas correctamente al servicio.",
                    201
                );
            }

            // Si se enviaron URLs en el body JSON (compatibilidad con develop)
            const { imagenes, urls, tipo } = req.body || {};
            const listaImagenes = imagenes || urls || [];
            if (listaImagenes.length > 0) {
                const servicio = await ServicioService.agregarImagenes(id, {
                    imagenes: listaImagenes,
                    tipo
                });

                return successResponse(
                    res,
                    servicio,
                    "Imágenes agregadas correctamente al servicio.",
                    201
                );
            }

            return successResponse(
                res,
                await ServicioService.obtenerPorId(id),
                "No se proporcionaron imágenes para subir."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // AGREGAR IMÁGENES (Compatibilidad directa con develop)
    // ======================================================

    async agregarImagenes(req, res, next) {
        try {

            const { id } = req.params;
            const { imagenes, urls, tipo } = req.body || {};

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

    // ======================================================
    // OBTENER IMÁGENES DEL SERVICIO
    // ======================================================

    async obtenerImagenes(req, res, next) {
        try {
            const { id } = req.params;

            const imagenes = await ServicioService.obtenerImagenes(
                id,
                req.user
            );

            return successResponse(
                res,
                imagenes,
                "Imágenes del servicio obtenidas correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // ELIMINAR IMAGEN DEL SERVICIO
    // ======================================================

    async eliminarImagen(req, res, next) {
        try {
            const { id, imagenId } = req.params;

            const resultado = await ServicioService.eliminarImagen(
                id,
                imagenId,
                req.user
            );

            return successResponse(
                res,
                resultado,
                "Imagen eliminada correctamente de Cloudinary y del servicio."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // NOTIFICAR CONDUCTOR EN CAMINO
    // ======================================================
    async notificarEnCamino(req, res, next) {
        try {
            const { id } = req.params;
            const resultado = await ServicioService.notificarEnCamino(
                id,
                req.user
            );

            return successResponse(
                res,
                resultado,
                "Notificación de conductor en camino enviada correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

}

export default new ServicioController();
