import { Router } from "express";

import rolController from "./rol.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearRolSchema,
    actualizarRolSchema
} from "./rol.validation.js";

const router = Router();

router.get("/", rolController.obtenerTodos);

router.get("/:id", rolController.obtenerPorId);

router.post(
    "/",
    validateSchema(crearRolSchema),
    rolController.crear
);

router.put(
    "/:id",
    validateSchema(actualizarRolSchema),
    rolController.actualizar
);

router.delete("/:id", rolController.eliminar);

export default router;