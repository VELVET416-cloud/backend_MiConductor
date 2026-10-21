import { getIO } from "../config/socket.js";

/**
 * Emite una nueva notificación a la sala privada del usuario.
 */
export const emitirNotificacionAUsuario = (usuarioId, notificacion) => {
    try {
        const io = getIO();
        const idStr = usuarioId?.toString ? usuarioId.toString() : String(usuarioId);
        io.to(`usuario:${idStr}`).emit("notificacion:nueva", notificacion);
    } catch (error) {
        // Ignorar si Socket.IO no está inicializado (ej. en pruebas unitarias)
    }
};

/**
 * Emite una notificación a todos los administradores conectados.
 */
export const emitirNotificacionAAdmins = (notificacion) => {
    try {
        const io = getIO();
        io.to("rol:ADMINISTRADOR").emit("notificacion:nueva", notificacion);
    } catch (error) {
        // Ignorar si Socket.IO no está inicializado
    }
};

/**
 * Emite evento de notificación leída al usuario.
 */
export const emitirNotificacionLeida = (usuarioId, datos) => {
    try {
        const io = getIO();
        const idStr = usuarioId?.toString ? usuarioId.toString() : String(usuarioId);
        io.to(`usuario:${idStr}`).emit("notificacion:leida", datos);
    } catch (error) {
        // Ignorar si Socket.IO no está inicializado
    }
};

/**
 * Emite evento de todas las notificaciones leídas al usuario.
 */
export const emitirTodasLeidas = (usuarioId) => {
    try {
        const io = getIO();
        const idStr = usuarioId?.toString ? usuarioId.toString() : String(usuarioId);
        io.to(`usuario:${idStr}`).emit("notificacion:todas_leidas", {
            contadorNoLeidas: 0
        });
    } catch (error) {
        // Ignorar si Socket.IO no está inicializado
    }
};

