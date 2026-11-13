import { Router } from "express";

import ConductorController from "./conductor.controller.js";

import {
    crearConductorSchema,
    actualizarConductorSchema,
    cambiarDisponibilidadSchema,
    cambiarEstadoAdministrativoSchema,
    actualizarLicenciaSchema
} from "./conductor.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.conductores"),
    validateSchema(crearConductorSchema),
    ConductorController.crear
);

router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.conductores", "crear.conductores", "editar.conductores", "asignar.solicitudes", "crear.novedades"),
    ConductorController.obtenerTodos
);

router.get(
    "/disponibles",
    ConductorController.obtenerDisponibles
);

router.get(
    "/usuario/:usuarioId",
    ConductorController.obtenerPorUsuario
);

router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.conductores", "editar.conductores", "ver.solicitudes", "ver.novedades"),
    ConductorController.obtenerPorId
);

router.patch(
    "/:id/disponibilidad",
    authMiddleware,
    permisoMiddleware("editar.conductores"),
    validateSchema(cambiarDisponibilidadSchema),
    ConductorController.cambiarDisponibilidad
);

router.patch(
    "/:id/estado-administrativo",
    authMiddleware,
    permisoMiddleware("editar.conductores"),
    validateSchema(cambiarEstadoAdministrativoSchema),
    ConductorController.cambiarEstadoAdministrativo
);

router.patch(
    "/:id/licencia",
    authMiddleware,
    permisoMiddleware("editar.conductores"),
    validateSchema(actualizarLicenciaSchema),
    ConductorController.actualizarLicencia
);

router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.conductores"),
    validateSchema(actualizarConductorSchema),
    ConductorController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permisoMiddleware("eliminar.conductores"),
    ConductorController.eliminar
);

export default router;
