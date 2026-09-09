import AuthService from "./auth.service.js";
import { successResponse } from "../../responses/success.response.js";

class AuthController {

    // Iniciar sesión
    async login(req, res, next) {

        try {

            const resultado = await AuthService.login(req.body);

            return successResponse(
                res,
                resultado,
                "Inicio de sesión exitoso."
            );

        } catch (error) {

            next(error);

        }

    }

    async mobileLogin(req, res, next) {
        try {
            const resultado = await AuthService.mobileLogin(req.body);

            return successResponse(
                res,
                resultado,
                "Inicio de sesión exitoso."
            );
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {

        try {

            await AuthService.forgotPassword(req.body);

            return successResponse(
                res,
                null,
                "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
            );

        } catch (error) {

            next(error);

        }

    }

    async resetPassword(req, res, next) {

        try {

            await AuthService.resetPassword(req.body);

            return successResponse(
                res,
                null,
                "Contraseña actualizada correctamente."
            );

        } catch (error) {

            next(error);

        }

    }

}

export default new AuthController();