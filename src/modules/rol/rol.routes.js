import { Router } from "express";

import rolController from "./rol.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

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
    authMiddleware,
    permisoMiddleware("crear.roles"),
    validateSchema(crearRolSchema),
    rolController.crear
);

// =========================
// Obtener todos los roles
// =========================
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.roles", "crear.roles", "editar.roles", "ver.usuarios", "crear.usuarios", "editar.usuarios"),
    rolController.obtenerTodos
);

// =========================
// Obtener rol por ID
// =========================
router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.roles", "editar.roles"),
    rolController.obtenerPorId
);

// =========================
// Actualizar rol
// =========================
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.roles"),
    validateSchema(actualizarRolSchema),
    rolController.actualizar
);

// =========================
// Eliminar rol
// =========================
router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.roles"),
    rolController.eliminar
);

export default router;