// import http from "http";

// import app from "./app.js";

// import { env } from "./config/env.js";
// import { connectDB } from "./config/database.js";

// import { initSocket } from "./config/socket.js";
// import { registerSocketEvents } from "./sockets/index.js";

// const startServer = async () => {

//     if (env.MONGO_URI) {

//         await connectDB();

//     } else {

//         console.log("⚠ MongoDB aún no está configurado.");

//     }

//     const server = http.createServer(app);

//     const io = initSocket(server);

//     registerSocketEvents(io);

//     server.listen(env.PORT, () => {

//         console.log(`🚀 Servidor ejecutándose en el puerto ${env.PORT}`);

//     });

// };

// startServer();


import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { initSocket } from "./config/socket.js";
import { registerSocketEvents } from "./sockets/index.js";

import { seedRoles } from "./seeders/rol.seeder.js";
import { seedPermisos } from "./seeders/permiso.seeder.js";

const startServer = async () => {
  await connectDB();
  await seedRoles();
  await seedPermisos()

  const server = http.createServer(app);

  const io = initSocket(server);

  registerSocketEvents(io);

  server.listen(env.PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${env.PORT}`);
  });
};

startServer();