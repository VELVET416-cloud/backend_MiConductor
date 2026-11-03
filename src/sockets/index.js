import { registerLocationEvents } from "./location.socket.js";
import { socketAuthMiddleware } from "./socketAuth.middleware.js";

export const registerSocketEvents = (io) => {

    // Middleware de autenticación JWT para todos los sockets
    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {

        if (socket.user) {
            // Unir al usuario a su sala privada
            const roomUsuario = `usuario:${socket.user.id}`;
            socket.join(roomUsuario);
            console.log(`🔌 Socket ${socket.id} autenticado y unido a ${roomUsuario}`);

            // Unir a salas por rol
            const rol = (socket.user.rol || "").toUpperCase();
            if (rol === "ADMINISTRADOR" || rol === "ADMIN") {
                socket.join("rol:ADMINISTRADOR");
                socket.join("sala:administradores");
            } else if (rol === "CONDUCTOR") {
                socket.join("rol:CONDUCTOR");
            } else if (rol === "CLIENTE") {
                socket.join("rol:CLIENTE");
            }
        } else {
            console.log(`🔌 Cliente anónimo conectado: ${socket.id}`);
        }

        socket.on("disconnect", () => {
            console.log(`🔌 Cliente desconectado: ${socket.id}`);
        });

    });

    // ======================================================
    // Registrar eventos de ubicacion / trazabilidad
    // ======================================================
    registerLocationEvents(io);

};