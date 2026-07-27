import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "Uno o más identificadores tienen un formato inválido."
    );

const nullableObjectIdSchema = z
    .union([
        objectIdSchema,
        z.null()
    ])
    .optional();

const tipoSchema = z
    .string({
        required_error: "El tipo de novedad es obligatorio."
    })
    .trim()
    .transform(tipo => tipo.toUpperCase())
    .refine(
        tipo => tiposNovedad.includes(tipo),
        "El tipo de novedad no es válido."
    );

const severidadSchema = z
    .string({
        required_error: "La severidad de la novedad es obligatoria."
    })
    .trim()
    .transform(severidad => severidad.toUpperCase())
    .refine(
        severidad => severidadesNovedad.includes(severidad),
        "La severidad de la novedad no es válida."
    );

const estadoNovedadSchema = z
    .string({
        required_error: "El estado de la novedad es obligatorio."
    })
    .trim()
    .transform(estado => estado.toUpperCase())
    .refine(
        estado => estadosNovedad.includes(estado),
        "El estado de la novedad no es válido."
    );

const novedadBaseSchema = z.object({

    titulo: z
        .string({
            required_error: "El título de la novedad es obligatorio."
        })
        .trim()
        .min(5, "El título debe tener al menos 5 caracteres.")
        .max(200, "El título no puede superar los 200 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción de la novedad es obligatoria."
        })
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres.")
        .max(1000, "La descripción no puede superar los 1000 caracteres."),

    tipo: tipoSchema,

    severidad: severidadSchema,

    solicitud: nullableObjectIdSchema,

    conductor: nullableObjectIdSchema,

    usuarioRegistro: objectIdSchema,

    estadoNovedad: estadoNovedadSchema
        .default("PENDIENTE")
        .optional(),

    fechaCierre: z
        .union([
            z.coerce.date(),
            z.null()
        ])
        .optional()
        .default(null),

    observaciones: z
        .union([
            z
                .string()
                .trim()
                .min(5, "Las observaciones deben tener al menos 5 caracteres.")
                .max(1000, "Las observaciones no pueden superar los 1000 caracteres."),
            z.null()
        ])
        .optional()
        .default(null),

    evidenciaUrl: z
        .union([
            z
                .string()
                .trim()
                .url("La URL de la evidencia no es válida."),
            z.null()
        ])
        .optional()
        .default(null)

});

export const crearNovedadSchema = novedadBaseSchema;

export const actualizarNovedadSchema = novedadBaseSchema
    .partial()
    .extend({
        estadoNovedad: estadoNovedadSchema.optional()
    });

export const cambiarEstadoNovedadSchema = z.object({
    estadoNovedad: estadoNovedadSchema,
    observaciones: z
        .union([
            z
                .string()
                .trim()
                .min(5, "Las observaciones deben tener al menos 5 caracteres.")
                .max(1000, "Las observaciones no pueden superar los 1000 caracteres."),
            z.null()
        ])
        .optional()
        .default(null)
});
