import mongoose from "mongoose";

const coordenadaSchema = new mongoose.Schema(
    {
        lat: {
            type: Number,
            required: [true, "La latitud es obligatoria."]
        },

        lng: {
            type: Number,
            required: [true, "La longitud es obligatoria."]
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const seguimientoSchema = new mongoose.Schema(
    {
        servicio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Servicio",
            required: [true, "El servicio es obligatorio."],
            unique: true
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            required: [true, "El conductor es obligatorio."]
        },

        coordenadas: {
            type: [coordenadaSchema],
            default: []
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

const Seguimiento = mongoose.model("Seguimiento", seguimientoSchema);

export default Seguimiento;