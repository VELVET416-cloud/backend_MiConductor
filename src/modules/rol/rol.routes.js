import { Router } from "express";

import rolController from "./rol.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearRolSchema,
    actualizarRolSchema
} from "./rol.validation.js";

const router = Router();

// =========================
// Crear rol
// =========================
router.post(
    "/",
    validateSchema(crearRolSchema),
    rolController.crear
);

// =========================
// Obtener todos los roles
// =========================
router.get(
    "/",
    rolController.obtenerTodos
);

// =========================
// Obtener rol por ID
// =========================
router.get(
    "/:id",
    rolController.obtenerPorId
);

// =========================
// Actualizar rol
// =========================
router.put(
    "/:id",
    validateSchema(actualizarRolSchema),
    rolController.actualizar
);

// =========================
// Eliminar rol
// =========================
router.delete(
    "/:id",
    rolController.eliminar
);

export default router;