import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AuthRepository from "./auth.repository.js";

import AppError from "../../utils/AppError.js";
import { env } from "../../config/env.js";

class AuthService {

    async login(datos) {

        // Normalizar correo
        const correo = datos.correo.trim().toLowerCase();

        // Buscar usuario
        const usuario = await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        // Comparar contraseña
        const passwordCorrecta = await bcrypt.compare(
            datos.password,
            usuario.password
        );

        if (!passwordCorrecta) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: usuario._id,
                rol: usuario.rol.nombre
            },
            env.JWT_SECRET,
            {
                expiresIn: env.JWT_EXPIRES_IN
            }
        );

        // Quitar contraseña
        usuario.password = undefined;

        return {
            token,
            usuario
        };

    }

}

export default new AuthService();