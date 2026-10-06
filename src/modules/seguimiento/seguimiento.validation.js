import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearSeguimientoSchema,
    coordenadaSchema,
    servicioIdParamSchema,
    seguimientoIdParamSchema
} from "./seguimiento.schema.js";

export const validarCrearSeguimiento =
    validateSchema(crearSeguimientoSchema);

export const validarCoordenada =
    validateSchema(coordenadaSchema);

export const validarServicioIdParam =
    validateSchema(servicioIdParamSchema, "params");

export const validarSeguimientoIdParam =
    validateSchema(seguimientoIdParamSchema, "params");