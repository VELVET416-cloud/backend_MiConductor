import { Router } from "express";

import ClienteController from "./cliente.controller.js";

import {
    crearClienteSchema,
    actualizarClienteSchema
} from "./cliente.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

// Crear cliente
router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.clientes"),
    validateSchema(crearClienteSchema),
    ClienteController.crear
);

// Obtener todos los clientes (Paginado)
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.clientes", "crear.clientes", "editar.clientes", "crear.vehiculos", "editar.vehiculos", "crear.solicitudes"),
    ClienteController.obtenerTodos
);

// Obtener lista completa de clientes activos (Sin paginar)
router.get(
    "/lista",
    authMiddleware,
    permisoMiddleware("ver.clientes", "crear.clientes", "editar.clientes", "crear.vehiculos", "editar.vehiculos", "crear.solicitudes"),
    ClienteController.obtenerLista
);

// Verificar existencia de documento / cédula
router.get(
    "/verificar-documento/:documento",
    ClienteController.verificarDocumento
);

// Obtener cliente por ID
router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.clientes", "editar.clientes", "ver.vehiculos", "ver.solicitudes"),
    ClienteController.obtenerPorId
);

// Actualizar cliente
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.clientes"),
    validateSchema(actualizarClienteSchema),
    ClienteController.actualizar
);

// Eliminar cliente
router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.clientes"),
    ClienteController.eliminar
);

export default router;
