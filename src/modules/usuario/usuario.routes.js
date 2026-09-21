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
    (req, res, next) => {
        console.log("POST /api/usuarios");
        console.log("BODY:", req.body);
        next();
    },
    validateSchema(crearUsuarioSchema),
    UsuarioController.crear
);

// Obtener todos
router.get(
    "/",
    (req, res, next) => {
        console.log("GET /api/usuarios");
        next();
    },
    UsuarioController.obtenerTodos
);

// Obtener por ID
router.get(
    "/:id",
    (req, res, next) => {
        console.log("GET /api/usuarios/:id");
        console.log("ID RECIBIDO:", req.params.id);
        next();
    },
    UsuarioController.obtenerPorId
);

// Actualizar
router.put(
    "/:id",
    (req, res, next) => {
        console.log("PUT /api/usuarios/:id");
        console.log("ID RECIBIDO:", req.params.id);
        console.log("BODY:", req.body);
        next();
    },
    validateSchema(actualizarUsuarioSchema),
    UsuarioController.actualizar
);

// Eliminar
router.delete(
    "/:id",
    UsuarioController.eliminar
);

export default router;