import validateSchema from "../../middlewares/validateSchema.js";
import {
    obtenerPorSolicitudSchema,
    servicioIdSchema,
    eliminarImagenServicioSchema
} from "./servicio.schema.js";

export const validarObtenerPorSolicitud =
    validateSchema(obtenerPorSolicitudSchema, "params");

export const validarServicioId =
    validateSchema(servicioIdSchema, "params");

export const validarEliminarImagenServicio =
    validateSchema(eliminarImagenServicioSchema, "params");