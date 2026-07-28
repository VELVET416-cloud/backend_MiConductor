import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema(
    {

        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario es obligatorio."],
            unique: true
        },

        licencia: {
            type: String,
            required: [true, "La licencia es obligatoria."],
            unique: true,
            trim: true
        },

        categoriaLicencia: {
            type: String,
            required: [true, "La categoría de la licencia es obligatoria."],
            uppercase: true,
            trim: true
        },

        fechaExpedicion: {
            type: Date,
            required: [true, "La fecha de expedición es obligatoria."]
        },

        fechaVencimiento: {
            type: Date,
            required: [true, "La fecha de vencimiento es obligatoria."]
        },

        experiencia: {
            type: Number,
            default: 0,
            min: 0
        },

        disponible: {
            type: Boolean,
            default: false
        },

        estado: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Conductor = mongoose.model(
    "Conductor",
    conductorSchema
);

export default Conductor;