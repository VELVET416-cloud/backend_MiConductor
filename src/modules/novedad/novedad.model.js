import mongoose from "mongoose";

const tiposNovedad = [
    "MECANICA",
    "VIAL",
    "CLIENTE",
    "ADMINISTRATIVA",
    "OTROS"
];

const severidadesNovedad = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "CRITICA"
];

const estadosNovedad = [
    "PENDIENTE",
    "EN_ATENCION",
    "RESUELTA",
    "CERRADA"
];

const novedadSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: [true, "El título de la novedad es obligatorio."],
            trim: true,
            maxlength: 200
        },

        descripcion: {
            type: String,
            required: [true, "La descripción de la novedad es obligatoria."],
            trim: true,
            maxlength: 1000
        },

        tipo: {
            type: String,
            required: [true, "El tipo de novedad es obligatorio."],
            enum: {
                values: tiposNovedad,
                message: "El tipo de novedad no es válido."
            },
            trim: true,
            uppercase: true
        },

        severidad: {
            type: String,
            required: [true, "La severidad de la novedad es obligatoria."],
            enum: {
                values: severidadesNovedad,
                message: "La severidad de la novedad no es válida."
            },
            trim: true,
            uppercase: true
        },

        solicitud: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solicitud",
            default: null
        },

        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            default: null
        },

        usuarioRegistro: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario que registra la novedad es obligatorio."]
        },

        estadoNovedad: {
            type: String,
            required: true,
            enum: {
                values: estadosNovedad,
                message: "El estado de la novedad no es válido."
            },
            default: "PENDIENTE",
            trim: true,
            uppercase: true
        },

        fechaCierre: {
            type: Date,
            default: null
        },

        observaciones: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },

        evidenciaUrl: {
            type: String,
            trim: true,
            default: null
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

const Novedad = mongoose.model("Novedad", novedadSchema);

export default Novedad;
