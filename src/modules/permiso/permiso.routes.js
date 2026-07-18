import { Router } from "express";

import permisoController from "./permiso.controller.js";

import { validarSchema } from "./permiso.schema.js";

import {
    crearPermisoSchema,
    actualizarPermisoSchema
} from "./permiso.validation.js";

const router = Router();

router.get("/", permisoController.obtenerTodos);

router.get("/:id", permisoController.obtenerPorId);

router.post(
    "/",
    validarSchema(crearPermisoSchema),
    permisoController.crear
);

router.put(
    "/:id",
    validarSchema(actualizarPermisoSchema),
    permisoController.actualizar
);

router.delete("/:id", permisoController.eliminar);

export default router;