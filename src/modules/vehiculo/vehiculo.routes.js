import { Router } from "express";

import VehiculoController from "./vehiculo.controller.js";

import {
    crearVehiculoSchema,
    actualizarVehiculoSchema
} from "./vehiculo.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

// Crear vehículo
router.post(
    "/",
    validateSchema(crearVehiculoSchema),
    VehiculoController.crear
);

// Obtener todos los vehículos
router.get(
    "/",
    VehiculoController.obtenerTodos
);

// Obtener vehículos de un cliente
router.get(
    "/cliente/:clienteId",
    VehiculoController.obtenerPorCliente
);

// Obtener vehículo por ID
router.get(
    "/:id",
    VehiculoController.obtenerPorId
);

// Actualizar vehículo
router.put(
    "/:id",
    validateSchema(actualizarVehiculoSchema),
    VehiculoController.actualizar
);

// Eliminar vehículo
router.delete(
    "/:id",
    VehiculoController.eliminar
);

export default router;