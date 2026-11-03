import NotificacionService from "./notificacion.service.js";
import { successResponse } from "../../responses/success.response.js";

class NotificacionController {

    // ======================================================
    // LISTAR NOTIFICACIONES DEL USUARIO AUTENTICADO
    // GET /api/notificaciones
    // ======================================================
    async listar(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const resultado = await NotificacionService.listar(usuarioId, req.query);

            return successResponse(
                res,
                resultado,
                "Notificaciones obtenidas correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // CONTADOR DE NO LEÍDAS
    // GET /api/notificaciones/no-leidas
    // ======================================================
    async obtenerContadorNoLeidas(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const resultado = await NotificacionService.obtenerContadorNoLeidas(usuarioId);

            return successResponse(
                res,
                resultado,
                "Contador de notificaciones no leídas obtenido correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
    // PATCH /api/notificaciones/:id/leida
    // ======================================================
    async marcarComoLeida(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const { id } = req.params;

            const notificacion = await NotificacionService.marcarComoLeida(id, usuarioId);

            return successResponse(
                res,
                notificacion,
                "Notificación marcada como leída correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // MARCAR TODAS LAS PROPIAS COMO LEÍDAS
    // PATCH /api/notificaciones/leidas
    // ======================================================
    async marcarTodasComoLeidas(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const resultado = await NotificacionService.marcarTodasComoLeidas(usuarioId);

            return successResponse(
                res,
                resultado,
                "Todas las notificaciones fueron marcadas como leídas."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // REGISTRAR / ACTUALIZAR TOKEN FCM DE DISPOSITIVO
    // POST /api/notificaciones/dispositivos
    // ======================================================
    async registrarDispositivo(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const resultado = await NotificacionService.registrarDispositivo(
                usuarioId,
                req.body
            );

            return successResponse(
                res,
                resultado,
                "Dispositivo registrado correctamente.",
                201
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // DESVINCULAR TOKEN DE DISPOSITIVO
    // DELETE /api/notificaciones/dispositivos
    // ======================================================
    async desvincularDispositivo(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const { token } = req.body;

            const resultado = await NotificacionService.desvincularDispositivo(
                usuarioId,
                token
            );

            return successResponse(
                res,
                resultado,
                "Dispositivo desvinculado correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // ENVIAR NOTIFICACIÓN DE PRUEBA
    // POST /api/notificaciones/test
    // ======================================================
    async enviarPrueba(req, res, next) {
        try {
            const usuarioId = req.user.id;
            const { titulo, mensaje, tipo } = req.body || {};

            const resultado = await NotificacionService.enviarPrueba(usuarioId, {
                titulo,
                mensaje,
                tipo
            });

            return successResponse(
                res,
                resultado,
                "Notificación de prueba enviada exitosamente.",
                201
            );
        } catch (error) {
            next(error);
        }
    }

}

export default new NotificacionController();

