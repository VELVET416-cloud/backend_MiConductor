import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(
                "Token requerido.",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return next(
                new AppError(
                    "Token inválido o expirado.",
                    401
                )
            );
        }

        next(error);

    }

};

export default authMiddleware;