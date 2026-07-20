import { z } from "zod";

export const crearNovedadSchema = z.object({
    titulo: z
        .string({
            required_error: "El título es obligatorio."
        })
        .trim()
        .min(3, "El título debe tener mínimo 3 caracteres.")
        .max(100, "El título no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .trim()
        .min(5, "La descripción debe tener mínimo 5 caracteres.")
        .max(500, "La descripción no puede superar los 500 caracteres."),

    tipo: z
        .enum(["RETRASO", "ACCIDENTE", "AVERIA", "CLIENTE_AUSENTE", "PINCHAZO", "PROBLEMA_MECANICO", "OTRO"], {
            required_error: "El tipo de novedad es obligatorio.",
            invalid_type_error: "El tipo de novedad no es válido."
        }),

    fecha: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "La fecha no es válida."
        })
        .optional()
        .default(new Date().toISOString()),

    estado: z
        .enum(["PENDIENTE", "EN_PROCESO", "RESUELTA", "CERRADA"])
        .optional()
        .default("PENDIENTE"),

    servicio: z
        .string({
            required_error: "El servicio es obligatorio."
        })
        .trim(),

    conductor: z
        .string({
            required_error: "El conductor es obligatorio."
        })
        .trim(),

    cliente: z
        .string({
            required_error: "El cliente es obligatorio."
        })
        .trim(),

    observaciones: z
        .string()
        .trim()
        .max(500, "Las observaciones no pueden superar los 500 caracteres.")
        .optional(),

    imagenes: z
        .array(z.string().url("Cada imagen debe ser una URL válida."))
        .optional()
        .default([]),

    activo: z
        .boolean()
        .optional()
        .default(true)
});

export const actualizarNovedadSchema = crearNovedadSchema.partial();

export const actualizarEstadoNovedadSchema = z.object({
    estado: z
        .enum(["PENDIENTE", "EN_PROCESO", "RESUELTA", "CERRADA"], {
            required_error: "El estado es obligatorio.",
            invalid_type_error: "El estado no es válido."
        })
});
