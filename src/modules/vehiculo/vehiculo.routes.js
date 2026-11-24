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

// Permite que un cliente registre o gestione sus propios vehiculos desde la app movil,
// o que usuarios administrativos con los permisos indicados accedan a la ruta.
const permitirClienteOPermiso = (...permisos) => {
    const checkPermiso = permisoMiddleware(...permisos);
    return (req, res, next) => {
        const rolRaw = req.user?.rol?.nombre || req.user?.rol || "";
        const rolNombre = rolRaw.toString().toUpperCase();
        if (rolNombre === "CLIENTE" || rolNombre === "CLIENTES") {
            return next();
        }
        return checkPermiso(req, res, next);
    };
};

// Crear vehiculo
router.post(
    "/",
    authMiddleware,
    permitirClienteOPermiso("crear.vehiculos"),
    validateSchema(crearVehiculoSchema),
    VehiculoController.crear
);

// Obtener todos los vehiculos
router.get(
    "/",
    authMiddleware,
    permitirClienteOPermiso("ver.vehiculos", "crear.vehiculos", "editar.vehiculos", "crear.solicitudes"),
    VehiculoController.obtenerTodos
);

// Verificar disponibilidad de placa (ANTES de /:id para evitar colisiones)
router.get(
    "/verificar-placa/:placa",
    VehiculoController.verificarPlaca
);

// Obtener vehiculos de un cliente
router.get(
    "/cliente/:clienteId",
    VehiculoController.obtenerPorCliente
);

// Obtener vehiculo por ID
router.get(
    "/:id",
    authMiddleware,
    permitirClienteOPermiso("ver.vehiculos", "editar.vehiculos", "ver.solicitudes"),
    VehiculoController.obtenerPorId
);

// Cambiar estado del vehiculo
router.patch(
    "/:id/estado",
    authMiddleware,
    permitirClienteOPermiso("editar.vehiculos"),
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
);

router.put(
    "/:id/estado",
    authMiddleware,
    permitirClienteOPermiso("editar.vehiculos"),
    validateSchema(cambiarEstadoVehiculoSchema),
    VehiculoController.cambiarEstado
);

// Actualizar vehiculo
router.put(
    "/:id",
    authMiddleware,
    permitirClienteOPermiso("editar.vehiculos"),
    validateSchema(actualizarVehiculoSchema),
    VehiculoController.actualizar
);

// Eliminar vehiculo
router.delete(
    "/:id",
    authMiddleware,
    permitirClienteOPermiso("eliminar.vehiculos"),
    VehiculoController.eliminar
);

export default router;
