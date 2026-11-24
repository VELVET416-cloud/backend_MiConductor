import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "Uno o más identificadores tienen un formato inválido."
    );

const estadoSchema = z
    .string({
        required_error: "El estado es obligatorio."
    })
    .trim()
    .transform(estado => estado.toUpperCase())
    .refine(
        estado => estadosSolicitud.includes(estado),
        "El estado enviado no es válido."
    );

const prioridadSchema = z
    .string({
        required_error: "La prioridad es obligatoria."
    })
    .trim()
    .transform(prioridad => prioridad.toUpperCase())
    .refine(
        prioridad => prioridadesSolicitud.includes(prioridad),
        "La prioridad enviada no es válida."
    );

const solicitudBaseSchema = z.object({

    codigo: z
        .string({
            required_error: "El código es obligatorio."
        })
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres.")
        .max(50, "El código no puede superar los 50 caracteres.")
        .transform(codigo => codigo.toUpperCase()),

    cliente: objectIdSchema,

    correoCliente: z
        .string({
            required_error: "El correo del cliente es obligatorio."
        })
        .trim()
        .email("El correo del cliente no es válido.")
        .transform(correo => correo.toLowerCase()),

    conductorAsignado: objectIdSchema.optional(),

    vehiculo: objectIdSchema.optional(),

    tipoServicio: z
        .string({
            required_error: "El tipo de servicio es obligatorio."
        })
        .trim()
        .min(3, "El tipo de servicio debe tener al menos 3 caracteres.")
        .max(100, "El tipo de servicio no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres.")
        .max(500, "La descripción no puede superar los 500 caracteres."),

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

    fechaProgramada: z.coerce.date({
        required_error: "La fecha programada es obligatoria."
    }),

    prioridad: prioridadSchema

});

export const crearSolicitudSchema = solicitudBaseSchema;

export const actualizarSolicitudSchema = solicitudBaseSchema
    .partial()
    .extend({
        estado: estadoSchema.optional()
    });

export const asignarConductorSchema = z.object({
    conductorAsignado: objectIdSchema
});