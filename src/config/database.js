import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    console.log("=====================================");
    console.log("Intentando conectar a MongoDB...");
    // Nunca imprimir la URI completa: incluye usuario y contraseña
    console.log("MONGO_URI:", (env.MONGO_URI || "").replace(/\/\/([^@/]+)@/, "//***:***@"));
    console.log("=====================================");

    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

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