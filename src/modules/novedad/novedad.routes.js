import { Router } from "express";

import NovedadController from "./novedad.controller.js";

import {
    crearNovedadSchema,
    actualizarNovedadSchema,
    cambiarEstadoNovedadSchema
} from "./novedades.validation.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

// ======================================================
// Crear novedad
// ======================================================
router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.novedades"),
    validateSchema(crearNovedadSchema),
    NovedadController.crear
);

// ======================================================
// Obtener todas las novedades
// ======================================================
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.novedades", "crear.novedades", "editar.novedades"),
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
    authMiddleware,
    permisoMiddleware("ver.novedades", "editar.novedades"),
    NovedadController.obtenerPorId
);

// ======================================================
// Cambiar estado de la novedad
// ======================================================
router.patch(
    "/:id/estado",
    authMiddleware,
    permisoMiddleware("editar.novedades"),
    validateSchema(cambiarEstadoNovedadSchema),
    NovedadController.cambiarEstado
);

// ======================================================
// Actualizar novedad
// ======================================================
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.novedades"),
    validateSchema(actualizarNovedadSchema),
    NovedadController.actualizar
);

// ======================================================
// Eliminar novedad
// ======================================================
router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.novedades"),
    NovedadController.eliminar
);

export default router;
