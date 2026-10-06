import mongoose from "mongoose";

const servicioSchema = new mongoose.Schema(
    {
        solicitud: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solicitud",
            required: [true, "La solicitud es obligatoria."],
            unique: true
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            required: [true, "El conductor es obligatorio."]
        },

        estado: {
            type: String,
            required: true,
            enum: ["ACTIVO", "FINALIZADO", "CANCELADO"],
            default: "ACTIVO",
            trim: true,
            uppercase: true
        },

        fechaInicio: {
            type: Date,
            default: Date.now
        },

        fechaFin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Servicio = mongoose.model("Servicio", servicioSchema);

export default Servicio;