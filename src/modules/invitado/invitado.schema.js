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

export const crearSolicitudInvitadoSchema = z.object({
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

    prioridad: z
        .string({
            required_error: "La prioridad es obligatoria."
        })
        .trim()
        .transform(prioridad => prioridad.toUpperCase())
        .refine(
            prioridad => prioridadesSolicitud.includes(prioridad),
            "La prioridad enviada no es válida."
        )
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