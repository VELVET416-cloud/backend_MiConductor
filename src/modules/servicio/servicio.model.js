import mongoose from "mongoose";

const imagenSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, "La URL de la imagen es obligatoria."],
            trim: true
        },

        public_id: {
            type: String,
            required: [true, "El public_id de la imagen es obligatorio."],
            trim: true
        },

        formato: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

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
        },

        imagenes: {
            type: [imagenSchema],
            default: []
        },

        fotosIniciales: {
            type: [String],
            default: []
        },

        fotosEntrega: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Servicio = mongoose.model("Servicio", servicioSchema);

export default Servicio;
