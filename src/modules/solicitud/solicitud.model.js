import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

const generarCodigoSolicitud = () => {
    const fecha = new Date();
    const fechaCodigo = [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0")
    ].join("");

    const aleatorio = randomBytes(4).toString("hex").toUpperCase();

    return `SOL-${fechaCodigo}-${aleatorio}`;
};

const solicitudSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            default: generarCodigoSolicitud
        },

        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            required: [true, "El cliente es obligatorio."]
        },

        correoCliente: {
            type: String,
            required: [true, "El correo del cliente es obligatorio."],
            trim: true,
            lowercase: true
        },

        conductorAsignado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            default: null
        },

        vehiculo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehiculo",
            default: null
        },

        tipoServicio: {
            type: String,
            required: [true, "El tipo de servicio es obligatorio."],
            trim: true
        },

        descripcion: {
            type: String,
            required: [true, "La descripción es obligatoria."],
            trim: true
        },

        origen: {
            type: String,
            required: [true, "El origen es obligatorio."],
            trim: true
        },

        destino: {
            type: String,
            required: [true, "El destino es obligatorio."],
            trim: true
        },

        fechaProgramada: {
            type: Date,
            required: true,
            default: Date.now
        },

        prioridad: {
            type: String,
            required: [true, "La prioridad es obligatoria."],
            enum: ["BAJA", "MEDIA", "ALTA", "URGENTE"],
            trim: true,
            uppercase: true
        },

        estado: {
            type: String,
            required: true,
            enum: [
                "PENDIENTE",
                "EN_PROCESO",
                "COMPLETADO",
                "CANCELADO"
            ],
            default: "PENDIENTE",
            trim: true,
            uppercase: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

solicitudSchema.index({ codigo: 1 }, { unique: true });

const Solicitud = mongoose.model("Solicitud", solicitudSchema);

export default Solicitud;