import mongoose from "mongoose";

const solicitudSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, "El código es obligatorio."],
            unique: true,
            trim: true,
            uppercase: true
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
            required: [true, "La fecha programada es obligatoria."]
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
            enum: ["PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO"],
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

const Solicitud = mongoose.model("Solicitud", solicitudSchema);

export default Solicitud;