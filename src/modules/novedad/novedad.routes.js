import { Router } from "express";

import novedadController from "./novedad.controller.js";
import { validarSchema } from "./novedad.schema.js";
import {
    crearNovedadSchema,
    actualizarNovedadSchema,
    actualizarEstadoNovedadSchema
} from "./novedad.validation.js";

const router = Router();

router.get("/", novedadController.obtenerTodos);
router.get("/:id", novedadController.obtenerPorId);
router.get("/servicios/:id/novedades", novedadController.obtenerPorServicio);
router.get("/conductores/:id/novedades", novedadController.obtenerPorConductor);

router.post(
    "/",
    validarSchema(crearNovedadSchema),
    novedadController.crear
);

router.put(
    "/:id",
    validarSchema(actualizarNovedadSchema),
    novedadController.actualizar
);

router.patch(
    "/:id/estado",
    validarSchema(actualizarEstadoNovedadSchema),
    novedadController.actualizarEstado
);

router.delete("/:id", novedadController.eliminar);

export default router;
