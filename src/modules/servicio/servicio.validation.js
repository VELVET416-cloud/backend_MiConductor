import validateSchema from "../../middlewares/validateSchema.js";
import {
    obtenerPorSolicitudSchema,
    servicioIdSchema
} from "./servicio.schema.js";

export const validarObtenerPorSolicitud =
    validateSchema(obtenerPorSolicitudSchema, "params");

export const validarServicioId =
    validateSchema(servicioIdSchema);