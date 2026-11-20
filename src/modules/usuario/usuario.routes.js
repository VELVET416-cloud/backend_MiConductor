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
    permisoMiddleware("ver.usuarios", "crear.usuarios", "editar.usuarios"),
    UsuarioController.obtenerTodos
);

// Obtener usuario por ID (permite ver el propio perfil o tener permiso de usuarios)
router.get(
    "/:id",
    authMiddleware,
    (req, res, next) => {
        if (String(req.user?.id) === String(req.params.id)) {
            return next();
        }
        return permisoMiddleware("ver.usuarios", "editar.usuarios")(req, res, next);
    },
    UsuarioController.obtenerPorId
);

// Actualizar usuario (permite actualizar el propio perfil o tener permiso de editar.usuarios)
router.put(
    "/:id",
    authMiddleware,
    (req, res, next) => {
        const esPropioPerfil = String(req.user?.id) === String(req.params.id);
        const esAdmin = req.user?.rol === "ADMINISTRADOR";
        const puedeEditarUsuarios = esAdmin || (req.user?.permisos || []).includes("editar.usuarios");

        if (esPropioPerfil && !puedeEditarUsuarios) {
            if (req.body) {
                delete req.body.rol;
                delete req.body.estado;
            }
            return next();
        }
        return permisoMiddleware("editar.usuarios")(req, res, next);
    },
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
