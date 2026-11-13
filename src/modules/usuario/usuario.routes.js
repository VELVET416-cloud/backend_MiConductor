import { Router } from "express";

import UsuarioController from "./usuario.controller.js";

import {
    crearUsuarioSchema,
    actualizarUsuarioSchema
} from "./usuario.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

// Crear usuario
router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.usuarios"),
    validateSchema(crearUsuarioSchema),
    UsuarioController.crear
);

// Consultar usuario por documento (público / autocompletado)
router.get(
    "/consulta-documento/:documento",
    UsuarioController.consultarPorDocumento
);
router.get(
    "/consulta/:documento",
    UsuarioController.consultarPorDocumento
);

// Obtener todos los usuarios
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.usuarios"),
    UsuarioController.obtenerTodos
);

// Obtener usuario por ID
router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.usuarios"),
    UsuarioController.obtenerPorId
);

// Actualizar usuario
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.usuarios"),
    validateSchema(actualizarUsuarioSchema),
    UsuarioController.actualizar
);

// Eliminar usuario
router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.usuarios"),
    UsuarioController.eliminar
);

export default router;
