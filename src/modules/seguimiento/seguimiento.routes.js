import { Router } from "express";
import SeguimientoController from "./seguimiento.controller.js";
import {
    validarCrearSeguimiento,
    validarCoordenada,
    validarServicioIdParam,
    validarSeguimientoIdParam
} from "./seguimiento.validation.js";

const router = Router();

// ======================================================
// Crear (iniciar) seguimiento
// ======================================================
router.post(
    "/",
    validarCrearSeguimiento,
    SeguimientoController.crear
);

// ======================================================
// Obtener todos los seguimientos
// ======================================================
router.get(
    "/",
    SeguimientoController.obtenerTodos
);

// ======================================================
// Obtener seguimientos activos
// ======================================================
router.get(
    "/activos",
    SeguimientoController.obtenerActivos
);

// ======================================================
// Obtener seguimiento por ID
// ======================================================
router.get(
    "/:id",
    validarSeguimientoIdParam,
    SeguimientoController.obtenerPorId
);

// ======================================================
// Obtener seguimiento por servicio
// ======================================================
router.get(
    "/servicio/:servicioId",
    validarServicioIdParam,
    SeguimientoController.obtenerPorServicio
);

// ======================================================
// Agregar coordenada (testing / simulacion)
// ======================================================
router.post(
    "/:id/coordenada",
    validarSeguimientoIdParam,
    validarCoordenada,
    SeguimientoController.agregarCoordenada
);

// ======================================================
// Finalizar seguimiento
// ======================================================
router.patch(
    "/:id/finalizar",
    validarSeguimientoIdParam,
    SeguimientoController.finalizar
);

export default router;