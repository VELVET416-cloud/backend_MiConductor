import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    console.log("✅ Base de datos conectada correctamente.");
  } catch (error) {
    console.error("❌ Error al conectar MongoDB");
    console.error(error.message);

    process.exit(1);
  }
};