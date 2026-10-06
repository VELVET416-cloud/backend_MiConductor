import { Router } from "express";
import ServicioController from "./servicio.controller.js";
import {
    validarServicioId,
    validarObtenerPorSolicitud
} from "./servicio.validation.js";

const router = Router();

// ======================================================
// Obtener todos los servicios
// ======================================================
router.get(
    "/",
    ServicioController.obtenerTodos
);

// ======================================================
// Obtener servicio por ID
// ======================================================
router.get(
    "/:id",
    validarServicioId,
    ServicioController.obtenerPorId
);

// ======================================================
// Obtener servicio por solicitud
// ======================================================
router.get(
    "/solicitud/:solicitudId",
    validarObtenerPorSolicitud,
    ServicioController.obtenerPorSolicitud
);

export default router;