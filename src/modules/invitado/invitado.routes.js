import { Router } from "express";

import InvitadoController from "./invitado.controller.js";

import {
    validarCrearSolicitudInvitado,
    validarConsultarSolicitudInvitado
} from "./invitado.validation.js";

const router = Router();

router.post(
    "/solicitud",
    validarCrearSolicitudInvitado,
    InvitadoController.crearSolicitud
);

router.get(
    "/solicitud/:codigo",
    validarConsultarSolicitudInvitado,
    InvitadoController.consultarSolicitudPorCodigo
);

export default router;