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

// Permite que un usuario con rol CLIENTE consulte o actualice su propio perfil/foto desde la app móvil,
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
    permitirClienteOPermiso("ver.clientes", "crear.clientes", "editar.clientes", "crear.vehiculos", "editar.vehiculos", "crear.solicitudes"),
    ClienteController.obtenerTodos
);

// Obtener lista completa de clientes activos (Sin paginar)
router.get(
    "/lista",
    authMiddleware,
    permitirClienteOPermiso("ver.clientes", "crear.clientes", "editar.clientes", "crear.vehiculos", "editar.vehiculos", "crear.solicitudes"),
    ClienteController.obtenerLista
);

// Página pública de activación de cuenta y creación de contraseña para clientes
router.get(
    "/activar-cuenta",
    ClienteController.activarCuentaPage.bind(ClienteController)
);

router.post(
    "/activar-cuenta",
    ClienteController.activarCuentaSubmit.bind(ClienteController)
);

// Verificar existencia de documento / cédula
router.get(
    "/verificar-documento/:documento",
    ClienteController.verificarDocumento
);

// Verificar existencia de correo electrónico
router.get(
    "/verificar-correo/:correo",
    ClienteController.verificarCorreo
);

// Obtener cliente por ID de Usuario (usado desde app móvil)
router.get(
    "/usuario/:usuarioId",
    authMiddleware,
    permitirClienteOPermiso("ver.clientes", "editar.clientes"),
    ClienteController.obtenerPorUsuario
);

// Obtener cliente por ID
router.get(
    "/:id",
    authMiddleware,
    permitirClienteOPermiso("ver.clientes", "editar.clientes", "ver.vehiculos", "ver.solicitudes"),
    ClienteController.obtenerPorId
);

// Actualizar cliente (incluye foto de perfil desde móvil)
router.put(
    "/:id",
    authMiddleware,
    permitirClienteOPermiso("editar.clientes"),
    validateSchema(actualizarClienteSchema),
    ClienteController.actualizar
);

// Actualizar foto de perfil del cliente
router.patch(
    "/:id/foto",
    authMiddleware,
    permitirClienteOPermiso("editar.clientes"),
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


router.post(
    "/:id/convertir-a-conductor",
    authMiddleware,
    ClienteController.convertirAConductor
);

export default router;
