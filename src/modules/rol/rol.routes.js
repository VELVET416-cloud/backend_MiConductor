import { Router } from "express";

import rolController from "./rol.controller.js";

import { validarSchema } from "./rol.schema.js";

import {
    crearRolSchema,
    actualizarRolSchema
} from "./rol.validation.js";

const router = Router();

router.get("/", rolController.obtenerTodos);

router.get("/:id", rolController.obtenerPorId);

router.post(
    "/",
    validarSchema(crearRolSchema),
    rolController.crear
);

router.put(
    "/:id",
    validarSchema(actualizarRolSchema),
    rolController.actualizar
);

router.delete("/:id", rolController.eliminar);

export default router;