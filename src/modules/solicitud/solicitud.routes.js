import { Router } from "express";

import SolicitudController from "./solicitud.controller.js";
import InvitadoController from "../invitado/invitado.controller.js";
import { validarCrearSolicitudInvitado } from "../invitado/invitado.validation.js";

import {
    validarCrearSolicitud,
    validarActualizarSolicitud,
    validarAsignarConductor
} from "./solicitud.validation.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import permisoMiddleware from "../../middlewares/permiso.middleware.js";

const router = Router();

// ======================================================
// Crear solicitud como invitado (Pública / Sin token)
// ======================================================
router.post(
    "/invitado",
    validarCrearSolicitudInvitado,
    InvitadoController.crearSolicitud
);

// ======================================================
// Crear solicitud desde el panel
// ======================================================
router.post(
    "/",
    authMiddleware,
    permisoMiddleware("crear.solicitudes"),
    validarCrearSolicitud,
    SolicitudController.crear
);

// ======================================================
// Obtener todas las solicitudes
// ======================================================
router.get(
    "/",
    authMiddleware,
    permisoMiddleware("ver.solicitudes", "crear.solicitudes", "asignar.solicitudes", "ruta.solicitudes", "cancelar.solicitudes", "crear.novedades"),
    SolicitudController.obtenerTodos
);

// ======================================================
// Obtener solicitud por ID
// ======================================================
router.get(
    "/:id",
    authMiddleware,
    permisoMiddleware("ver.solicitudes", "asignar.solicitudes", "ruta.solicitudes", "cancelar.solicitudes"),
    SolicitudController.obtenerPorId
);

// ======================================================
// Asignar conductor
// ======================================================
router.patch(
    "/:id/asignar-conductor",
    authMiddleware,
    permisoMiddleware("asignar.solicitudes"),
    validarAsignarConductor,
    SolicitudController.asignarConductor
);

// ======================================================
// Cancelar solicitud
// ======================================================
router.patch(
    "/:id/cancelar",
    authMiddleware,
    permisoMiddleware("cancelar.solicitudes"),
    SolicitudController.cancelar
);

// ======================================================
// Completar solicitud
// ======================================================
router.patch(
    "/:id/completar",
    authMiddleware,
    SolicitudController.completar
);

// ======================================================
// Calificar conductor por parte del cliente
// ======================================================
router.patch(
    "/:id/calificar",
    authMiddleware,
    SolicitudController.calificar
);

// ======================================================
// Actualizar solicitud
// ======================================================
router.put(
    "/:id",
    authMiddleware,
    permisoMiddleware("editar.solicitudes", "asignar.solicitudes", "cancelar.solicitudes", "crear.solicitudes"),
    validarActualizarSolicitud,
    SolicitudController.actualizar
);

export default router;