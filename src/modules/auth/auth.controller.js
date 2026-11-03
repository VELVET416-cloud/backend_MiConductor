import AuthService from "./auth.service.js";
import ClienteService from "../cliente/cliente.service.js";
import { successResponse } from "../../responses/success.response.js";

class AuthController {

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

    async checkEmail(req, res, next) {
        try {
            const correo = req.query.correo || req.body?.correo;
            const resultado = await AuthService.checkEmail(correo);
            return successResponse(
                res,
                resultado,
                resultado.exists ? "Este correo ya está registrado." : "Correo disponible."
            );
        } catch (error) {
            next(error);
        }
    }

    async checkDocument(req, res, next) {
        try {
            const documento = req.query.documento || req.body?.documento;
            const tipoDocumento = req.query.tipoDocumento || req.body?.tipoDocumento;
            const resultado = await AuthService.checkDocument(documento, tipoDocumento);
            return successResponse(
                res,
                resultado,
                resultado.exists ? "Este número de documento ya está registrado." : "Documento disponible."
            );
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const cliente = await ClienteService.crear(req.body);
            return successResponse(
                res,
                cliente,
                "Cliente registrado correctamente.",
                201
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
                "Se ha enviado un enlace de recuperación a tu correo electrónico."
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

    verificarPropiedadCuenta(req, res, next) {
        try {
            AuthService.verificarPropiedadCuenta(req.user, req.body || {});
            next();
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            await AuthService.changePassword(req.user, req.body);
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
