import { Router } from "express";

import VehiculoController from "./vehiculo.controller.js";

import {
    crearVehiculoSchema,
    actualizarVehiculoSchema,
    cambiarEstadoVehiculoSchema
} from "./vehiculo.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

// Crear vehículo
router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.vehiculos"),
    validateSchema(crearVehiculoSchema),
    VehiculoController.crear
);

// Obtener todos los vehículos
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.vehiculos"),
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
    authMiddleware,
    permisoMiddleware("ver.vehiculos"),
    VehiculoController.obtenerPorId
);

// Cambiar estado del vehículo
router.patch(
    "/:id/estado",
    authMiddleware,
    permisoMiddleware("editar.vehiculos"),
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
);

router.put(
    "/:id/estado",
    authMiddleware,
    permisoMiddleware("editar.vehiculos"),
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
);

// Actualizar vehículo
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.vehiculos"),
    validateSchema(actualizarVehiculoSchema),
    VehiculoController.actualizar
);

// Eliminar vehículo
router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.vehiculos"),
    VehiculoController.eliminar
);

export default router;