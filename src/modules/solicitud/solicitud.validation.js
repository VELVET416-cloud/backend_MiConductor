import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearSolicitudSchema,
    actualizarSolicitudSchema,
    asignarConductorSchema
} from "./solicitud.schema.js";

export const validarCrearSolicitud =
    validateSchema(crearSolicitudSchema);

export const validarActualizarSolicitud =
    validateSchema(actualizarSolicitudSchema);

export const validarAsignarConductor =
    validateSchema(asignarConductorSchema);