import { Router } from "express";

import InvitadoController from "./invitado.controller.js";
import UsuarioController from "../usuario/usuario.controller.js";

import {
    validarCrearSolicitudInvitado,
    validarConsultarSolicitudInvitado
} from "./invitado.validation.js";

const router = Router();

// Consultar documento sin autenticación (compatibilidad)
router.get(
    "/consulta-documento/:documento",
    UsuarioController.consultarPorDocumento
);

// Crear solicitud como invitado
router.post(
    "/solicitud",
    validarCrearSolicitudInvitado,
    InvitadoController.crearSolicitud
);

// Consultar estado de solicitud por código
router.get(
    "/solicitud/:codigo",
    validarConsultarSolicitudInvitado,
    InvitadoController.consultarSolicitudPorCodigo
);

export default router;
