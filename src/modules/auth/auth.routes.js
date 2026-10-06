import { Router } from "express";

import AuthController from "./auth.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import {
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "./auth.validation.js";



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


export default router;