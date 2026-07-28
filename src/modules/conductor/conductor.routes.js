import { Router } from "express";

import ConductorController from "./conductor.controller.js";

import {
    crearConductorSchema,
    actualizarConductorSchema,
    cambiarDisponibilidadSchema,
    actualizarLicenciaSchema
} from "./conductor.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

// =========================
// Crear conductor
// =========================
router.post(
    "/",
    validateSchema(crearConductorSchema),
    ConductorController.crear
);

// =========================
// Obtener todos los conductores
// =========================
router.get(
    "/",
    ConductorController.obtenerTodos
);

// =========================
// Obtener conductores disponibles
// =========================
router.get(
    "/disponibles",
    ConductorController.obtenerDisponibles
);

// =========================
// Obtener conductor por usuario
// =========================
router.get(
    "/usuario/:usuarioId",
    ConductorController.obtenerPorUsuario
);

// =========================
// Obtener conductor por ID
// =========================
router.get(
    "/:id",
    ConductorController.obtenerPorId
);

// =========================
// Cambiar disponibilidad
// =========================
router.patch(
    "/:id/disponibilidad",
    validateSchema(cambiarDisponibilidadSchema),
    ConductorController.cambiarDisponibilidad
);

// =========================
// Actualizar licencia
// (Más adelante se protegerá con JWT y rol Administrador)
// =========================
router.patch(
    "/:id/licencia",
    validateSchema(actualizarLicenciaSchema),
    ConductorController.actualizarLicencia
);

// =========================
// Actualizar conductor
// =========================
router.put(
    "/:id",
    validateSchema(actualizarConductorSchema),
    ConductorController.actualizar
);

// =========================
// Eliminar conductor
// =========================
router.delete(
    "/:id",
    ConductorController.eliminar
);

export default router;