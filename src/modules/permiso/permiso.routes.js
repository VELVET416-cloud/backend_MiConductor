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
    permisoMiddleware("permisos.ver"),
    permisoController.obtenerTodos
);

router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("permisos.ver"),
    permisoController.obtenerPorId
);

router.post(
    "/",
    authMiddleware,
    permisoMiddleware("permisos.crear"),
    validateSchema(crearPermisoSchema),
    permisoController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("permisos.editar"),
    validateSchema(actualizarPermisoSchema),
    permisoController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("permisos.eliminar"),
    permisoController.eliminar
);

export default router;