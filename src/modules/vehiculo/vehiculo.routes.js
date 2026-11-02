import { Router } from "express";

import VehiculoController from "./vehiculo.controller.js";

import {
    crearVehiculoSchema,
    actualizarVehiculoSchema,
    cambiarEstadoVehiculoSchema
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

// Verificar disponibilidad de placa (ANTES de /:id para evitar colisiones)
router.get(
    "/verificar-placa/:placa",
    VehiculoController.verificarPlaca
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

// Cambiar estado del vehículo
router.patch(
    "/:id/estado",
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
);

router.put(
    "/:id/estado",
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
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