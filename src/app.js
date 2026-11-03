import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/api/index.js";
import { env } from "./config/env.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";

const app = express();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a la API de Mi Conductor 🚗",
  });
});

const allowedOrigins = [
  env.CLIENT_URL,
  env.MOBILE_CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origen (como apps móviles nativas, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Permitir localhost y 127.0.0.1 en cualquier puerto
      const esLocalhost =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("https://127.0.0.1:");

      // Permitir IPs de red local (para pruebas móviles y web en LAN: 192.168.x.x, 172.16-31.x.x, 10.x.x.x)
      const esRedLocal =
        /^https?:\/\/(192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|10\.)/.test(origin);

      if (
        allowedOrigins.includes(origin) ||
        esLocalhost ||
        esRedLocal ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origen no permitido por CORS: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);

app.use(errorMiddleware);

export default app;
