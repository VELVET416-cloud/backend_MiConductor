import { Router } from "express";

import permisoController from "./permiso.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearPermisoSchema,
    actualizarPermisoSchema
} from "./permiso.validation.js";

const router = Router();

router.get("/", permisoController.obtenerTodos);

router.get("/:id", permisoController.obtenerPorId);

router.post(
    "/",
    validateSchema(crearPermisoSchema),
    permisoController.crear
);

router.put(
    "/:id",
    validateSchema(actualizarPermisoSchema),
    permisoController.actualizar
);

router.delete("/:id", permisoController.eliminar);

export default router;