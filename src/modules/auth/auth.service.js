import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import AuthRepository from "./auth.repository.js";
import EmailService from "./email.service.js";

import AppError from "../../utils/AppError.js";
import { env } from "../../config/env.js";

class AuthService {

    async login(datos) {

        const correo =
            datos.correo.trim().toLowerCase();

        const usuario =
            await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        const passwordCorrecta =
            await bcrypt.compare(
                datos.password,
                usuario.password
            );

        if (!passwordCorrecta) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        if (usuario.rol.nombre !== "ADMINISTRADOR") {
            throw new AppError(
                "Este usuario no tiene acceso al panel administrativo.",
                403
            );
        }

        const token = jwt.sign(
            {
                id: usuario._id
            },
            env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        return {
            token
        };
    }

    async mobileLogin(datos) {
        const correo = datos.correo.trim().toLowerCase();

        const usuario = await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

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

        const rol = usuario.rol.nombre;

        if (rol !== "CONDUCTOR" && rol !== "CLIENTE") {
            throw new AppError(
                "Este usuario no tiene acceso a la aplicación móvil.",
                403
            );
        }

        const token = jwt.sign(
            { id: usuario._id },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        return {
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol
            }
        };
    }


    async forgotPassword(datos) {

        const correo =
            datos.correo.trim().toLowerCase();

        const usuario =
            await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            return;
        }

        const token =
            crypto.randomBytes(32).toString("hex");

        const expiracion =
            new Date(
                Date.now() + 15 * 60 * 1000
            );

        await AuthRepository.guardarTokenRecuperacion(
            usuario._id,
            token,
            expiracion
        );

        await EmailService.enviarCorreoRecuperacion(
            usuario.correo,
            usuario.nombre,
            token,
            datos.origen
        );

        usuario.ultimoAcceso = new Date();
        await usuario.save();

    }


    async forgotPassword(datos) {

        const correo =
            datos.correo.trim().toLowerCase();

        const usuario =
            await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            return;
        }

        const token =
            crypto.randomBytes(32).toString("hex");

        const expiracion =
            new Date(
                Date.now() + 15 * 60 * 1000
            );

        await AuthRepository.guardarTokenRecuperacion(
            usuario._id,
            token,
            expiracion
        );

        await EmailService.enviarCorreoRecuperacion(
            usuario.correo,
            usuario.nombre,
            token
        );

    }

    async resetPassword(datos) {

        const usuario =
            await AuthRepository.obtenerPorTokenRecuperacion(
                datos.token
            );

        if (!usuario) {

            throw new AppError(
                "El enlace de recuperación no es válido o ha expirado.",
                400
            );

        }

        const salt =
            await bcrypt.genSalt(10);

        const passwordHash =
            await bcrypt.hash(
                datos.password,
                salt
            );

        await AuthRepository.actualizarPassword(
            usuario._id,
            passwordHash
        );

    }

    async resetPassword(datos) {

    const usuario =
        await AuthRepository.obtenerPorTokenRecuperacion(
            datos.token
        );

    if (!usuario) {

        throw new AppError(
            "El enlace de recuperación no es válido o ha expirado.",
            400
        );

    }

    const salt =
        await bcrypt.genSalt(10);

    const passwordHash =
        await bcrypt.hash(
            datos.password,
            salt
        );

    await AuthRepository.actualizarPassword(
        usuario._id,
        passwordHash
    );

}

}

export default new AuthService();