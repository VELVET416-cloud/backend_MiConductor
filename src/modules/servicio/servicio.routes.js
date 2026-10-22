import { Router } from "express";
import ServicioController from "./servicio.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import uploadImagenesMiddleware from "../../middlewares/upload.middleware.js";
import {
    validarServicioId,
    validarObtenerPorSolicitud,
    validarEliminarImagenServicio
} from "./servicio.validation.js";

const router = Router();

// ======================================================
// Obtener todos los servicios
// ======================================================
router.get(
    "/",
    ServicioController.obtenerTodos
);

// ======================================================
// Subir imágenes al servicio (Cloudinary o URLs)
// ======================================================
router.post(
    "/:id/imagenes",
    authMiddleware,
    validarServicioId,
    uploadImagenesMiddleware("imagenes", 5),
    ServicioController.subirImagenes
);

// ======================================================
// Agregar imágenes / evidencias al servicio (PATCH /develop)
// ======================================================
router.patch(
    "/:id/imagenes",
    validarServicioId,
    ServicioController.agregarImagenes
);

// ======================================================
// Obtener imágenes de un servicio
// ======================================================
router.get(
    "/:id/imagenes",
    validarServicioId,
    ServicioController.obtenerImagenes
);

// ======================================================
// Eliminar imagen de un servicio (Cloudinary)
// ======================================================
router.delete(
    "/:id/imagenes/:imagenId",
    authMiddleware,
    validarEliminarImagenServicio,
    ServicioController.eliminarImagen
);

// ======================================================
// Obtener servicio por solicitud
// ======================================================
router.get(
    "/solicitud/:solicitudId",
    validarObtenerPorSolicitud,
    ServicioController.obtenerPorSolicitud
);

// ======================================================
// Obtener servicio por ID
// ======================================================
router.get(
    "/:id",
    validarServicioId,
    ServicioController.obtenerPorId
);

// ======================================================
// Notificar conductor en camino
// ======================================================
router.patch(
    "/:id/en-camino",
    authMiddleware,
    validarServicioId,
    ServicioController.notificarEnCamino
);

export default router;
