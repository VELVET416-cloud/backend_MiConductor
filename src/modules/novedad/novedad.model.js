import mongoose from "mongoose";

const novedadSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: [true, "El título es obligatorio"],
            trim: true,
            maxlength: 100
        },

        descripcion: {
            type: String,
            required: [true, "La descripción es obligatoria"],
            trim: true,
            maxlength: 500
        },

        tipo: {
            type: String,
            required: [true, "El tipo de novedad es obligatorio"],
            trim: true,
            enum: ["RETRASO", "ACCIDENTE", "AVERIA", "CLIENTE_AUSENTE", "PINCHAZO", "PROBLEMA_MECANICO", "OTRO"]
        },

        fecha: {
            type: Date,
            required: [true, "La fecha es obligatoria"],
            default: Date.now
        },

        estado: {
            type: String,
            required: true,
            enum: ["PENDIENTE", "EN_PROCESO", "RESUELTA", "CERRADA"],
            default: "PENDIENTE"
        },

        servicio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Servicio",
            required: true
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            required: true
        },

        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            required: true
        },

        observaciones: {
            type: String,
            trim: true,
            maxlength: 500
        },

        imagenes: {
            type: [String],
            default: []
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Novedad = mongoose.model("Novedad", novedadSchema);

export default Novedad;
