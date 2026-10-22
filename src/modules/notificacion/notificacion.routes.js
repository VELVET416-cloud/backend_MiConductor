import { Router } from "express";
import NotificacionController from "./notificacion.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    validarNotificacionId,
    validarRegistrarDispositivo,
    validarDesvincularDispositivo,
    validarListarNotificaciones
} from "./notificacion.validation.js";

const router = Router();

// Todas las operaciones de notificaciones requieren usuario autenticado
router.use(authMiddleware);

// Endpoints de lectura / consulta
router.get("/no-leidas", NotificacionController.obtenerContadorNoLeidas);
router.get("/", validarListarNotificaciones, NotificacionController.listar);

// Endpoints de actualización de lectura
router.patch("/leidas", NotificacionController.marcarTodasComoLeidas);
router.patch("/:id/leida", validarNotificacionId, NotificacionController.marcarComoLeida);

// Endpoints de gestión de dispositivos FCM
router.post("/dispositivos", validarRegistrarDispositivo, NotificacionController.registrarDispositivo);
router.delete("/dispositivos", validarDesvincularDispositivo, NotificacionController.desvincularDispositivo);

export default router;

