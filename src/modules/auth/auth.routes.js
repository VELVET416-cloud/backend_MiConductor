import { Router } from "express";
import AuthController from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateSchema from "../../middlewares/validateSchema.js";
import {
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from "./auth.validation.js";
import { crearClienteSchema } from "../cliente/cliente.schema.js";

const router = Router();

router.post(
    "/login",
    validateSchema(loginSchema),
    AuthController.login
);

router.post(
    "/mobile-login",
    validateSchema(loginSchema),
    AuthController.mobileLogin
);

router.post(
    "/forgot-password",
    validateSchema(forgotPasswordSchema),
    AuthController.forgotPassword
);

router.post(
    "/reset-password",
    validateSchema(resetPasswordSchema),
    AuthController.resetPassword
);

router.post(
    "/change-password",
    authMiddleware,
    AuthController.verificarPropiedadCuenta,
    validateSchema(changePasswordSchema),
    AuthController.changePassword
);

router.get(
    "/check-email",
    AuthController.checkEmail
);

router.get(
    "/check-document",
    AuthController.checkDocument
);

router.post(
    "/register",
    validateSchema(crearClienteSchema),
    AuthController.register
);

router.get("/verify-activation-token", AuthController.verifyActivationToken);
router.post("/activate-account", AuthController.activateAccount);

export default router;
