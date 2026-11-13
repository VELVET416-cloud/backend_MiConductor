import validateSchema from "../../middlewares/validateSchema.js";

import {
    crearSolicitudInvitadoSchema,
    consultarSolicitudInvitadoSchema
} from "./invitado.schema.js";

export const validarCrearSolicitudInvitado =
    validateSchema(crearSolicitudInvitadoSchema);

export const validarConsultarSolicitudInvitado = async (
    req,
    res,
    next
) => {
    try {
        req.params = await consultarSolicitudInvitadoSchema.parseAsync(
            req.params
        );

        next();
    } catch (error) {
        next(error);
    }
};