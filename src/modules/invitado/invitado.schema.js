import { z } from "zod";

const estadosSolicitud = [
    "PENDIENTE",
    "EN_PROCESO",
    "COMPLETADO",
    "CANCELADO"
];

const prioridadesSolicitud = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "URGENTE"
];

export const personaInvitadoSchema = z.object({
    tipoDocumento: z.string().trim().min(1, "El tipo de documento es obligatorio."),
    documento: z.string().trim().min(3, "El número de documento es obligatorio."),
    nombreCompleto: z.string().trim().min(2, "El nombre completo es obligatorio."),
    telefono: z.string().trim().min(5, "El teléfono es obligatorio."),
    correo: z.string().trim().email("El correo no es válido.")
});

export const documentosVehiculoSchema = z.object({
    tarjetaPropiedad: z.string().trim().min(1, "La foto de la tarjeta de propiedad es obligatoria."),
    soat: z.string().trim().min(1, "La foto del SOAT es obligatoria."),
    tecnomecanica: z.string().trim().min(1, "La foto de la tecnomecánica es obligatoria.")
});

export const vehiculoInvitadoSchema = z.object({
    marca: z.string().trim().min(1, "La marca del vehículo es obligatoria."),
    modelo: z.string().trim().min(1, "El modelo del vehículo es obligatorio."),
    anio: z.coerce.number().int().min(1900, "El año no es válido.").max(new Date().getFullYear() + 2),
    placa: z.string().trim().min(3, "La placa del vehículo es obligatoria."),
    color: z.string().trim().min(1, "El color del vehículo es obligatorio."),
    documentos: documentosVehiculoSchema
});

export const crearSolicitudInvitadoSchema = z.object({
    esParaTercero: z.boolean().default(false).optional(),
    beneficiario: personaInvitadoSchema.optional().nullable(),
    solicitante: personaInvitadoSchema.optional().nullable(),

    tipoServicio: z
        .string()
        .trim()
        .default("Transporte Ejecutivo")
        .optional(),

    descripcion: z
        .string()
        .trim()
        .default("Solicitud de servicio como invitado")
        .optional(),

    origen: z
        .string({
            required_error: "El origen es obligatorio."
        })
        .trim()
        .min(3, "El origen debe tener al menos 3 caracteres.")
        .max(200, "El origen no puede superar los 200 caracteres."),

    destino: z
        .string({
            required_error: "El destino es obligatorio."
        })
        .trim()
        .min(3, "El destino debe tener al menos 3 caracteres.")
        .max(200, "El destino no puede superar los 200 caracteres."),

    fechaProgramada: z.coerce.date().default(() => new Date()).optional(),

    prioridad: z
        .string()
        .trim()
        .default("MEDIA")
        .transform(prioridad => prioridad.toUpperCase())
        .refine(
            prioridad => prioridadesSolicitud.includes(prioridad),
            "La prioridad enviada no es válida."
        )
        .optional(),

    vehiculo: vehiculoInvitadoSchema.optional().nullable()
});

export const consultarSolicitudInvitadoSchema = z.object({
    codigo: z
        .string({
            required_error: "El código es obligatorio."
        })
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres.")
        .max(50, "El código no puede superar los 50 caracteres.")
        .transform(codigo => codigo.toUpperCase())
});

export const estadosSolicitudInvitado = estadosSolicitud;
