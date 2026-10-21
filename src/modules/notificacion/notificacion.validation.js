import validateSchema from "../../middlewares/validateSchema.js";
import {
    notificacionIdParamsSchema,
    registrarDispositivoSchema,
    desvincularDispositivoSchema,
    listarNotificacionesQuerySchema
} from "./notificacion.schema.js";

export const validarNotificacionId =
    validateSchema(notificacionIdParamsSchema, "params");

export const validarRegistrarDispositivo =
    validateSchema(registrarDispositivoSchema, "body");

export const validarDesvincularDispositivo =
    validateSchema(desvincularDispositivoSchema, "body");

export const validarListarNotificaciones =
    validateSchema(listarNotificacionesQuerySchema, "query");

