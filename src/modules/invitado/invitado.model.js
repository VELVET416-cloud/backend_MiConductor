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

        esInvitado: {
            type: Boolean,
            default: true
        },

        esParaTercero: {
            type: Boolean,
            default: false
        },

        beneficiario: {
            tipoDocumento: { type: String, trim: true },
            documento: { type: String, trim: true },
            nombreCompleto: { type: String, trim: true },
            telefono: { type: String, trim: true },
            correo: { type: String, trim: true, lowercase: true }
        },

        solicitante: {
            tipoDocumento: { type: String, trim: true, default: null },
            documento: { type: String, trim: true, default: null },
            nombreCompleto: { type: String, trim: true, default: null },
            telefono: { type: String, trim: true, default: null },
            correo: { type: String, trim: true, lowercase: true, default: null }
        },

        correoCliente: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },

        vehiculoInfo: {
            marca: { type: String, trim: true },
            modelo: { type: String, trim: true },
            anio: { type: Number },
            placa: { type: String, trim: true, uppercase: true },
            color: { type: String, trim: true },
            documentos: {
                tarjetaPropiedad: { type: String, trim: true },
                soat: { type: String, trim: true },
                tecnomecanica: { type: String, trim: true }
            }
        },

        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            default: null
        },

        vehiculo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehiculo",
            default: null
        },

        conductorAsignado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conductor",
            default: null
        },

        tipoServicio: {
            type: String,
            required: [true, "El tipo de servicio es obligatorio."],
            trim: true,
            default: "Transporte Ejecutivo"
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
            required: [true, "La fecha programada es obligatoria."],
            default: Date.now
        },

        prioridad: {
            type: String,
            required: [true, "La prioridad es obligatoria."],
            enum: ["BAJA", "MEDIA", "ALTA", "URGENTE"],
            trim: true,
            uppercase: true,
            default: "MEDIA"
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
