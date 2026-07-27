import { Router } from "express";

import NovedadController from "./novedad.controller.js";

import {
    crearNovedadSchema,
    actualizarNovedadSchema,
    cambiarEstadoNovedadSchema
} from "./novedades.validation.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

// ======================================================
// Crear novedad
// ======================================================
router.post(
    "/",
    validateSchema(crearNovedadSchema),
    NovedadController.crear
);

// ======================================================
// Obtener todas las novedades
// ======================================================
router.get(
    "/",
    NovedadController.obtenerTodos
);

// ======================================================
// Obtener novedades por solicitud
// ======================================================
router.get(
    "/solicitud/:solicitudId",
    NovedadController.obtenerPorSolicitud
);

// ======================================================
// Obtener novedades por conductor
// ======================================================
router.get(
    "/conductor/:conductorId",
    NovedadController.obtenerPorConductor
);

// ======================================================
// Obtener novedad por ID
// ======================================================
router.get(
    "/:id",
    NovedadController.obtenerPorId
);

// ======================================================
// Cambiar estado de la novedad
// ======================================================
router.patch(
    "/:id/estado",
    validateSchema(cambiarEstadoNovedadSchema),
    NovedadController.cambiarEstado
);

// ======================================================
// Actualizar novedad
// ======================================================
router.put(
    "/:id",
    validateSchema(actualizarNovedadSchema),
    NovedadController.actualizar
);

// ======================================================
// Eliminar novedad
// ======================================================
router.delete(
    "/:id",
    NovedadController.eliminar
);

export default router;
