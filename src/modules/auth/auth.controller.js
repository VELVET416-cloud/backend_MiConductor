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

}

export default new AuthController();