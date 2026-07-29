import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import AuthRepository from "../modules/auth/auth.repository.js";
import AppError from "../utils/AppError.js";

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            throw new AppError(
                "Token requerido.",
                401
            );

        }

        const token = authHeader.split(" ")[1];

        // Verificar el token
        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        // Buscar el usuario actualizado en la base de datos
        const usuario = await AuthRepository.obtenerPorId(
            decoded.id
        );

        if (!usuario) {

            throw new AppError(
                "Usuario no encontrado.",
                401
            );

        }

        // Guardar la información del usuario para usarla en los demás middlewares
        req.user = {

            id: usuario._id,

            nombre: usuario.nombre,

            apellido: usuario.apellido,

            correo: usuario.correo,

            rol: usuario.rol.nombre,

            permisos: usuario.rol.permisos.map(
                permiso => permiso.codigo
            )

        };

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