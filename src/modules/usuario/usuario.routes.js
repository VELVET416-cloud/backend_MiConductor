import { Router } from "express";

import UsuarioController from "./usuario.controller.js";

import {
    crearUsuarioSchema,
    actualizarUsuarioSchema
} from "./usuario.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

// Crear usuario
router.post(
    "/",
    validateSchema(crearUsuarioSchema),
    UsuarioController.crear
);

// Obtener todos los usuarios
router.get(
    "/",
    UsuarioController.obtenerTodos
);

// Obtener usuario por ID
router.get(
    "/:id",
    UsuarioController.obtenerPorId
);

// Actualizar usuario
router.put(
    "/:id",
    validateSchema(actualizarUsuarioSchema),
    UsuarioController.actualizar
);

// Eliminar usuario
router.delete(
    "/:id",
    UsuarioController.eliminar
);

export default router;
