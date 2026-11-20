import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import AuthRepository from "./auth.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import EmailService from "./email.service.js";
import {
    normalizeTipoDocumento,
    normalizeDocumento
} from "../cliente/cliente.schema.js";

import AppError from "../../utils/AppError.js";
import { env } from "../../config/env.js";

class AuthService {

    async login(datos) {
        const correo = (datos.correo || "").trim().toLowerCase();
        const password = datos.password || "";

        if (!correo || !password) {
            throw new AppError(
                "El correo y la contraseña son obligatorios.",
                400
            );
        }

        const usuario = await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        const rolNombre = usuario.rol?.nombre || "";
        if (!usuario.rol || usuario.rol.activo === false) {
            throw new AppError(
                "El rol asignado al usuario se encuentra inactivo o no es válido.",
                403
            );
        }
        const permisos = Array.isArray(usuario.rol?.permisos) ? usuario.rol.permisos : [];
        if (rolNombre === "CLIENTE") {
            throw new AppError(
                "Este usuario no tiene acceso al panel administrativo.",
                403
            );
        }

        const codigosPermisos = permisos
            .filter(p => p && (typeof p === "string" || p.activo !== false))
            .map(p => typeof p === "string" ? p : (p.codigo || ""))
            .filter(Boolean);
        const token = jwt.sign(
            {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: rolNombre,
                permisos: codigosPermisos
            },
            env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return {
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: rolNombre,
                permisos: codigosPermisos
            }
        };
    }

    async obtenerPerfilActual(userId) {
        if (!userId) {
            throw new AppError("Usuario no autenticado.", 401);
        }

        const usuario = await AuthRepository.obtenerPorId(userId);
        if (!usuario) {
            throw new AppError("Usuario no encontrado.", 404);
        }

        const rolNombre = usuario.rol?.nombre || "";
        const permisos = Array.isArray(usuario.rol?.permisos) ? usuario.rol.permisos : [];
        const codigosPermisos = permisos
            .filter(p => p && (typeof p === "string" || p.activo !== false))
            .map(p => typeof p === "string" ? p : (p.codigo || ""))
            .filter(Boolean);

        return {
            id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: rolNombre,
            rolId: usuario.rol?._id || null,
            permisos: codigosPermisos
        };
    }

    async mobileLogin(datos) {
        const correo = (datos.correo || "").trim().toLowerCase();
        const password = datos.password || "";

        if (!correo || !password) {
            throw new AppError(
                "El correo y la contraseña son obligatorios.",
                400
            );
        }

        const usuario = await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "Correo o contraseña incorrectos.",
                401
            );
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
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

    async checkEmail(correo) {
        if (!correo || !String(correo).trim()) {
            throw new AppError("El correo es obligatorio.", 400);
        }
        const correoNormalizado = String(correo).trim().toLowerCase();
        const usuario = await UsuarioRepository.obtenerPorCorreo(correoNormalizado);
        return {
            exists: Boolean(usuario),
            available: !usuario
        };
    }

    async checkDocument(documento, tipoDocumento) {
        if (!documento || !String(documento).trim()) {
            throw new AppError("El documento es obligatorio.", 400);
        }
        const tipoNormalizado = tipoDocumento ? normalizeTipoDocumento(tipoDocumento) : undefined;
        const documentoNormalizado = normalizeDocumento(documento, tipoNormalizado || "CC");
        const usuario = await UsuarioRepository.obtenerPorDocumento(
            documentoNormalizado,
            tipoNormalizado
        );

        let esConductor = false;
        if (usuario) {
            try {
                const { default: ConductorRepository } = await import("../conductor/conductor.repository.js");
                const cond = await ConductorRepository.obtenerPorUsuario(usuario._id);
                esConductor = Boolean(cond);
            } catch {
                esConductor = false;
            }
        }

        return {
            exists: Boolean(usuario),
            available: !usuario,
            esConductor,
            usuario: usuario ? {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                nombreCompleto: usuario.nombreCompleto || `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
                correo: usuario.correo,
                telefono: usuario.telefono,
                fechaNacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toISOString().split('T')[0] : '',
                edad: usuario.edad,
                rol: usuario.rol?.nombre || usuario.rol
            } : null
        };
    }

    async forgotPassword(datos) {
        const correo = (datos.correo || "").trim().toLowerCase();

        if (!correo) {
            throw new AppError("El correo es obligatorio.", 400);
        }

        const usuario = await AuthRepository.obtenerPorCorreo(correo);

        if (!usuario) {
            throw new AppError(
                "El correo electrónico ingresado no se encuentra registrado.",
                404
            );
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiracion = new Date(Date.now() + 15 * 60 * 1000);

        await AuthRepository.guardarTokenRecuperacion(
            usuario._id,
            token,
            expiracion
        );

        try {
            await EmailService.enviarCorreoRecuperacion(
                usuario.correo,
                usuario.nombre,
                token,
                datos.origen
            );
        } catch (_) {
            await AuthRepository.guardarTokenRecuperacion(
                usuario._id,
                null,
                null
            ).catch(() => {});

            throw new AppError(
                "No fue posible enviar el correo de recuperación en este momento. Intenta nuevamente.",
                500
            );
        }
    }

    async resetPassword(datos) {
        const usuario = await AuthRepository.obtenerPorTokenRecuperacion(
            datos.token
        );

        if (!usuario) {
            throw new AppError(
                "El enlace de recuperación no es válido o ha expirado.",
                400
            );
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(
            datos.password,
            salt
        );

        await AuthRepository.actualizarPassword(
            usuario._id,
            passwordHash
        );
    }

    verificarPropiedadCuenta(authUser, datos = {}) {
        if (!authUser || !authUser.id) {
            throw new AppError("Usuario no autenticado.", 401);
        }

        const targetId =
            datos.usuarioId ??
            datos.userId ??
            datos.id ??
            datos._id;

        if (
            targetId !== undefined &&
            targetId !== null &&
            String(targetId).trim() !== "" &&
            String(targetId).trim() !== String(authUser.id)
        ) {
            throw new AppError(
                "No tiene autorización para cambiar la contraseña de otra cuenta.",
                403
            );
        }

        if (
            datos.correo !== undefined &&
            datos.correo !== null &&
            String(datos.correo).trim() !== "" &&
            authUser.correo &&
            String(datos.correo).trim().toLowerCase() !==
                String(authUser.correo).trim().toLowerCase()
        ) {
            throw new AppError(
                "No tiene autorización para cambiar la contraseña de otra cuenta.",
                403
            );
        }
    }

    async changePassword(authUser, datos) {
        this.verificarPropiedadCuenta(authUser, datos);

        const rolesPermitidos = ["CLIENTE", "CONDUCTOR", "ADMINISTRADOR"];
        if (!authUser.rol || !rolesPermitidos.includes(authUser.rol)) {
            throw new AppError(
                "No tiene permisos para realizar esta acción.",
                403
            );
        }

        const currentPassword = datos.currentPassword || "";
        const newPassword = datos.newPassword || "";
        const confirmPassword = datos.confirmPassword;

        if (!currentPassword || !currentPassword.trim()) {
            throw new AppError("La contraseña actual es obligatoria.", 400);
        }

        if (!newPassword || !newPassword.trim()) {
            throw new AppError("La nueva contraseña es obligatoria.", 400);
        }

        if (newPassword.length < 6) {
            throw new AppError(
                "La nueva contraseña debe tener mínimo 6 caracteres.",
                400
            );
        }

        if (confirmPassword !== undefined && newPassword !== confirmPassword) {
            throw new AppError("Las contraseñas no coinciden.", 400);
        }

        const usuario = await AuthRepository.obtenerPorIdConPassword(
            authUser.id
        );

        if (!usuario) {
            throw new AppError("Usuario no encontrado.", 404);
        }

        if (!usuario.rol || !rolesPermitidos.includes(usuario.rol.nombre)) {
            throw new AppError(
                "No tiene permisos para realizar esta acción.",
                403
            );
        }

        const passwordCorrecta = await bcrypt.compare(
            currentPassword,
            usuario.password
        );

        if (!passwordCorrecta) {
            throw new AppError(
                "La contraseña actual es incorrecta.",
                400
            );
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(
            newPassword,
            salt
        );

        await AuthRepository.actualizarPassword(
            usuario._id,
            passwordHash
        );
    }

    async verifyActivationToken(token) {
        if (!token || typeof token !== "string") {
            throw new AppError("El token de activación es requerido.", 400);
        }

        const usuario = await AuthRepository.obtenerPorTokenActivacion(token);
        if (!usuario) {
            throw new AppError("El enlace de activación es inválido o ha expirado. Contacta al administrador para recibir uno nuevo.", 400);
        }

        return {
            valid: true,
            correo: usuario.correo,
            nombre: `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || usuario.nombreCompleto || "Usuario",
            rol: usuario.rol?.nombre || "Usuario"
        };
    }

    async activateAccount(datos) {
        const { token, password } = datos || {};

        if (!token) {
            throw new AppError("El token de activación es obligatorio.", 400);
        }

        if (!password || String(password).trim().length < 6) {
            throw new AppError("La contraseña debe tener al menos 6 caracteres.", 400);
        }

        const usuario = await AuthRepository.obtenerPorTokenActivacion(token);
        if (!usuario) {
            throw new AppError("El enlace de activación es inválido o ha expirado.", 400);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password.trim(), salt);

        await AuthRepository.activarCuenta(usuario._id, passwordHash);

        return {
            mensaje: "Cuenta activada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        };
    }
}

export default new AuthService();
