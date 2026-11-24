import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/api/index.js";
import { env } from "./config/env.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";

// import rolRoutes from "./modules/rol/rol.routes.js";

const app = express();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a la API de Mi Conductor 🚗",
  });
});

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorMiddleware);

app.use(notFound);


export default app;