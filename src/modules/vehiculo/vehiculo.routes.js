import { Router } from "express";

import vehiculoController from "./vehiculo.controller.js";
import { validarSchema } from "./vehiculo.schema.js";
import {
    crearVehiculoSchema,
    actualizarVehiculoSchema,
    actualizarEstadoVehiculoSchema
} from "./vehiculo.validation.js";

const router = Router();

router.get("/", vehiculoController.obtenerTodos);
router.get("/:id", vehiculoController.obtenerPorId);
router.get("/placa/:placa", vehiculoController.obtenerPorPlaca);
router.get("/conductores/:id/vehiculos", vehiculoController.obtenerPorConductor);

router.post(
    "/",
    validarSchema(crearVehiculoSchema),
    vehiculoController.crear
);

router.put(
    "/:id",
    validarSchema(actualizarVehiculoSchema),
    vehiculoController.actualizar
);

router.patch(
    "/:id/estado",
    validarSchema(actualizarEstadoVehiculoSchema),
    vehiculoController.actualizarEstado
);

router.delete("/:id", vehiculoController.eliminar);

export default router;
