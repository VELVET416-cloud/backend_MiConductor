import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import AuthRepository from "../modules/auth/auth.repository.js";

/**
 * Middleware de autenticación para conexiones de Socket.IO vía JWT.
 * Admite token en:
 * - socket.handshake.auth.token
 * - socket.handshake.headers.authorization
 * - socket.handshake.query.token
 */
export const socketAuthMiddleware = async (socket, next) => {
    try {
        const rawToken =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization ||
            socket.handshake.query?.token;

        if (!rawToken) {
            socket.user = null;
            return next();
        }

        const token = rawToken.startsWith("Bearer ")
            ? rawToken.split(" ")[1]
            : rawToken;

        const decoded = jwt.verify(token, env.JWT_SECRET);
        const usuario = await AuthRepository.obtenerPorId(decoded.id);

        if (usuario) {
            socket.user = {
                id: usuario._id.toString(),
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol?.nombre
            };
        } else {
            socket.user = null;
        }

        next();
    } catch (err) {
        socket.user = null;
        next();
    }
};

export default socketAuthMiddleware;

