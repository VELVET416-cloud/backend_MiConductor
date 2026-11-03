import mongoose from "mongoose";

import { estadosSolicitudInvitado } from "./invitado.schema.js";

const invitadoSolicitudSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, "El código es obligatorio."],
            unique: true,
            trim: true,
            uppercase: true
        },

        conductorAsignado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
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
            enum: estadosSolicitudInvitado,
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

const InvitadoSolicitud = mongoose.model(
    "InvitadoSolicitud",
    invitadoSolicitudSchema,
    "solicituds"
);

export default InvitadoSolicitud;