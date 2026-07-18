export const registerSocketEvents = (io) => {

    io.on("connection", (socket) => {

        console.log(`🟢 Cliente conectado: ${socket.id}`);

        socket.on("disconnect", () => {

            console.log(`🔴 Cliente desconectado: ${socket.id}`);

        });

    });

};