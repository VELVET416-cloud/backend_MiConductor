import { Router } from "express";

import ClienteController from "./cliente.controller.js";

import {
    crearClienteSchema,
    actualizarClienteSchema
} from "./cliente.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

// Crear cliente
router.post(
    "/",
    validateSchema(crearClienteSchema),
    ClienteController.crear
);

// Obtener todos los clientes
router.get(
    "/",
    ClienteController.obtenerTodos
);

// Obtener cliente por ID
router.get(
    "/:id",
    ClienteController.obtenerPorId
);

// Actualizar cliente
router.put(
    "/:id",
    validateSchema(actualizarClienteSchema),
    ClienteController.actualizar
);

// Eliminar cliente
router.delete(
    "/:id",
    ClienteController.eliminar
);

export default router;