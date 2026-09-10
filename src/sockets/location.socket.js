import SeguimientoService from "../modules/seguimiento/seguimiento.service.js";

export const registerLocationEvents = (io) => {

    io.on("connection", (socket) => {

        // ======================================================
        // Cliente se une a room de un servicio especifico
        // Admin y Cliente usan esto para recibir ubicaciones
        // ======================================================
        socket.on("seguimiento:subscribe", ({ servicioId }) => {
            if (servicioId) {
                socket.join(`servicio:${servicioId}`);
                console.log(`Socket ${socket.id} unido a room servicio:${servicioId}`);
            }
        });

        // ======================================================
        // Cliente sale de la room
        // ======================================================
        socket.on("seguimiento:unsubscribe", ({ servicioId }) => {
            if (servicioId) {
                socket.leave(`servicio:${servicioId}`);
                console.log(`Socket ${socket.id} salio de room servicio:${servicioId}`);
            }
        });

        // ======================================================
        // Recibir coordenada del conductor
        // Ahora: testing / simulacion
        // Despues: aplicacion movil del conductor
        // ======================================================
        socket.on("seguimiento:coordenada", async ({ servicioId, lat, lng }) => {
            try {

                if (!servicioId || lat == null || lng == null) {
                    return;
                }

                // Guardar en MongoDB (TODAS las coordenadas)
                const seguimiento = await SeguimientoService.agregarCoordenada(
                    servicioId,
                    { lat, lng, timestamp: new Date() }
                );

                if (!seguimiento) {
                    return;
                }

                // Emitir a todos los clientes suscritos a este servicio
                io.to(`servicio:${servicioId}`).emit("seguimiento:ubicacion", {
                    servicioId,
                    lat,
                    lng,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error("Error en seguimiento:coordenada:", error.message);
            }
        });

    });

};