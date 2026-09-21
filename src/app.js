import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/api/index.js";
import { env } from "./config/env.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";

const app = express();

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Bienvenido a la API de Mi Conductor 🚗"
    });
});

// Orígenes permitidos
const allowedOrigins = [
    env.CLIENT_URL
];

app.use(
    cors({
        origin: (origin, callback) => {

            // Permitir herramientas como Postman
            if (!origin) {
                return callback(null, true);
            }

            // Permitir cualquier localhost
            const esLocalhost =
                origin.startsWith("http://localhost:");

            if (
                allowedOrigins.includes(origin) ||
                esLocalhost
            ) {
                return callback(null, true);
            }

            return callback(
                new Error("Origen no permitido por CORS")
            );
        },

        credentials: true
    })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use("/api", routes);

app.use(notFound);

app.use(errorMiddleware);

export default app;