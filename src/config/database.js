import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    console.log("=====================================");
    console.log("Intentando conectar a MongoDB...");
    console.log("MONGO_URI:", env.MONGO_URI);
    console.log("=====================================");

    await mongoose.connect(env.MONGO_URI);

    console.log("✅ Base de datos conectada correctamente.");
  } catch (error) {
    console.log("=====================================");
    console.error("❌ Error al conectar MongoDB");
    console.error("Mensaje:", error.message);
    console.error("Nombre:", error.name);
    console.error("Código:", error.code);
    console.error("Causa:", error.cause);
    console.error("Error completo:");
    console.error(error);
    console.log("=====================================");

    process.exit(1);
  }
};