import { Router } from "express";

import ConductorController from "./conductor.controller.js";

import {
    crearConductorSchema,
    actualizarConductorSchema,
    cambiarDisponibilidadSchema,
    actualizarLicenciaSchema
} from "./conductor.schema.js";

import validateSchema from "../../middlewares/validateSchema.js";

const router = Router();

router.post(
    "/",
    validateSchema(crearConductorSchema),
    ConductorController.crear
);

router.get(
    "/",
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
    ConductorController.obtenerPorId
);

router.patch(
    "/:id/disponibilidad",
    validateSchema(cambiarDisponibilidadSchema),
    ConductorController.cambiarDisponibilidad
);

router.patch(
    "/:id/licencia",
    validateSchema(actualizarLicenciaSchema),
    ConductorController.actualizarLicencia
);

router.put(
    "/:id",
    validateSchema(actualizarConductorSchema),
    ConductorController.actualizar
);

router.delete(
    "/:id",
    ConductorController.eliminar
);

export default router;