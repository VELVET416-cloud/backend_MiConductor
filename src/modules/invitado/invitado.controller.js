import InvitadoService from "./invitado.service.js";
import { successResponse } from "../../responses/success.response.js";

class InvitadoController {

    // ======================================================
    // CREAR SOLICITUD COMO INVITADO
    // ======================================================

    async crearSolicitud(req, res, next) {
        try {

            const solicitud = await InvitadoService.crearSolicitud(
                req.body
            );

            return successResponse(
                res,
                solicitud,
                "Solicitud creada correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // ======================================================
    // CONSULTAR SOLICITUD POR CÓDIGO
    // ======================================================

    async consultarSolicitudPorCodigo(req, res, next) {
        try {

            const { codigo } = req.params;

            const solicitud =
                await InvitadoService.consultarSolicitudPorCodigo(codigo);

            return successResponse(
                res,
                solicitud,
                "Solicitud obtenida correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new InvitadoController();