import { Router } from "express";

import permisoController from "./permiso.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import authMiddleware from "../../middlewares/auth.middleware.js";

import permisoMiddleware from "../../middlewares/permiso.middleware.js";

import {
    crearPermisoSchema,
    actualizarPermisoSchema
} from "./permiso.validation.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.permisos"),
    permisoController.obtenerTodos
);

router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.permisos"),
    permisoController.obtenerPorId
);

router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.permisos"),
    validateSchema(crearPermisoSchema),
    permisoController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.permisos"),
    validateSchema(actualizarPermisoSchema),
    permisoController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.permisos"),
    permisoController.eliminar
);

export default router;