import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { initSocket } from "./config/socket.js";
import { registerSocketEvents } from "./sockets/index.js";

import { seedRoles } from "./seeders/rol.seeder.js";
import { seedPermisos } from "./seeders/permiso.seeder.js";
import { initNotificacionListeners } from "./modules/notificacion/notificacion.listener.js";
import initFirebase from "./config/firebase.js";

const startServer = async () => {
  await connectDB();
  await seedPermisos();
  await seedRoles();

  initFirebase();
  initNotificacionListeners();

  const server = http.createServer(app);

  const io = initSocket(server);

  registerSocketEvents(io);

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${env.PORT}`);
  });
};

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 UNHANDLED REJECTION:", reason);
});
process.on("exit", (code) => {
  console.log(`Node process exiting with code: ${code}`);
});

startServer();

