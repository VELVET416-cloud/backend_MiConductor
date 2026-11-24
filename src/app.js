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

// Configuración de orígenes permitidos
const allowedOrigins = (env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (Postman y aplicaciones móviles)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorMiddleware);

app.use(notFound);

export default app;
