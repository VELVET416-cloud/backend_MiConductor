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

// Permite a usuarios de la app móvil (CLIENTE y CONDUCTOR) o administradores con permisos
const permitirMobileOPermiso = (...permisos) => {
    const checkPermiso = permisoMiddleware(...permisos);
    return (req, res, next) => {
        const rolRaw = req.user?.rol?.nombre || req.user?.rol || "";
        const rolNombre = rolRaw.toString().toUpperCase();
        if (rolNombre === "CLIENTE" || rolNombre === "CLIENTES" || rolNombre === "CONDUCTOR" || rolNombre === "CONDUCTORES") {
            return next();
        }
        return checkPermiso(req, res, next);
    };
};

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
    permitirMobileOPermiso("crear.solicitudes"),
    validarCrearSolicitud,
    SolicitudController.crear
);

// ======================================================
// Obtener todas las solicitudes
// ======================================================
router.get(
    "/",
    authMiddleware,
    permitirMobileOPermiso("ver.solicitudes", "crear.solicitudes", "asignar.solicitudes", "ruta.solicitudes", "cancelar.solicitudes", "crear.novedades", "ver.conductores"),
    SolicitudController.obtenerTodos
);

// ======================================================
// Obtener solicitud por ID
// ======================================================
router.get(
    "/:id",
    authMiddleware,
    permitirMobileOPermiso("ver.solicitudes", "asignar.solicitudes", "ruta.solicitudes", "cancelar.solicitudes", "ver.conductores"),
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
    permitirMobileOPermiso("cancelar.solicitudes"),
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
    permitirMobileOPermiso("editar.solicitudes", "asignar.solicitudes", "cancelar.solicitudes", "crear.solicitudes"),
    validarActualizarSolicitud,
    SolicitudController.actualizar
);

export default router;
