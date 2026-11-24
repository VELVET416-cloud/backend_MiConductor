import { Router } from "express";

import AuthController from "./auth.controller.js";

import validateSchema from "../../middlewares/validateSchema.js";

import { loginSchema } from "./auth.validation.js";

const router = Router();

router.post(
    "/login",
    validateSchema(loginSchema),
    AuthController.login
);

export default router;