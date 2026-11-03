import mongoose from "mongoose";

export const TIPOS_NOTIFICACION = [
    "SOLICITUD_CREADA",
    "SERVICIO_ASIGNADO",
    "CONDUCTOR_EN_CAMINO",
    "SERVICIO_COMPLETADO",
    "SOLICITUD_CANCELADA",
    "NOVEDAD_REPORTADA",
    "SISTEMA",
    "OTRO"
];

const notificacionSchema = new mongoose.Schema(
    {
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El destinatario es obligatorio."],
            index: true
        },

        titulo: {
            type: String,
            required: [true, "El título de la notificación es obligatorio."],
            trim: true,
            maxlength: 200
        },

        mensaje: {
            type: String,
            required: [true, "El mensaje de la notificación es obligatorio."],
            trim: true,
            maxlength: 1000
        },

        tipo: {
            type: String,
            required: [true, "El tipo de notificación es obligatorio."],
            enum: {
                values: TIPOS_NOTIFICACION,
                message: "El tipo de notificación no es válido."
            },
            default: "SISTEMA",
            uppercase: true,
            trim: true,
            index: true
        },

        solicitud: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solicitud",
            default: null
        },

        servicio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Servicio",
            default: null
        },

        novedad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Novedad",
            default: null
        },

        leida: {
            type: Boolean,
            default: false,
            index: true
        },

        fechaLectura: {
            type: Date,
            default: null
        },

        datosExtra: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices compuestos para optimizar listados recientes y conteos por usuario
notificacionSchema.index({ destinatario: 1, createdAt: -1 });
notificacionSchema.index({ destinatario: 1, leida: 1, createdAt: -1 });

const Notificacion = mongoose.model("Notificacion", notificacionSchema);

export default Notificacion;

