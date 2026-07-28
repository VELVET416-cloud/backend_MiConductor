import { Router } from "express";

import SolicitudController from "./solicitud.controller.js";

import {
    validarCrearSolicitud,
    validarActualizarSolicitud,
    validarAsignarConductor
} from "./solicitud.validation.js";

const router = Router();

// ======================================================
// Crear solicitud
// ======================================================
router.post(
    "/",
    validarCrearSolicitud,
    SolicitudController.crear
);

// ======================================================
// Obtener todas las solicitudes
// ======================================================
router.get(
    "/",
    SolicitudController.obtenerTodos
);

// ======================================================
// Obtener solicitud por ID
// ======================================================
router.get(
    "/:id",
    SolicitudController.obtenerPorId
);

// ======================================================
// Asignar conductor
// ======================================================
router.patch(
    "/:id/asignar-conductor",
    validarAsignarConductor,
    SolicitudController.asignarConductor
);

// ======================================================
// Cancelar solicitud
// ======================================================
router.patch(
    "/:id/cancelar",
    SolicitudController.cancelar
);

// ======================================================
// Completar solicitud
// ======================================================
router.patch(
    "/:id/completar",
    SolicitudController.completar
);

// ======================================================
// Actualizar solicitud
// ======================================================
router.put(
    "/:id",
    validarActualizarSolicitud,
    SolicitudController.actualizar
);

export default router;