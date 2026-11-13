import mongoose from "mongoose";

const dispositivoSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario es obligatorio."],
            index: true
        },

        token: {
            type: String,
            required: [true, "El token FCM es obligatorio."],
            unique: true,
            trim: true
        },

        plataforma: {
            type: String,
            enum: ["FLUTTER", "ANDROID", "IOS", "WEB", "DESCONOCIDO"],
            default: "DESCONOCIDO",
            uppercase: true,
            trim: true
        },

        activo: {
            type: Boolean,
            default: true,
            index: true
        },

        ultimoUso: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

dispositivoSchema.index({ usuario: 1, activo: 1 });

const Dispositivo = mongoose.model("Dispositivo", dispositivoSchema);

export default Dispositivo;

