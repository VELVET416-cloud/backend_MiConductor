import { z } from "zod";
import { tiposNovedad, severidadesNovedad, estadosNovedad } from "./novedad.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;


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
        tipo => tiposNovedad.includes(tipo) || tipo.length > 0,
        "El tipo de novedad no es válido."
    );

const severidadSchema = z
    .string()
    .trim()
    .transform(severidad => severidad.toUpperCase())
    .refine(
        severidad => severidadesNovedad.includes(severidad),
        "La severidad de la novedad no es válida."
    )
    .optional();

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
        .string()
        .trim()
        .max(200, "El título no puede superar los 200 caracteres.")
        .optional(),

    descripcion: z
        .string()
        .trim()
        .max(1000, "La descripción no puede superar los 1000 caracteres.")
        .optional()
        .default("Novedad reportada en el servicio."),

    tipo: tipoSchema,

    // La severidad es asignada automáticamente por el backend según el tipo,
    // o enviada por el conductor si el tipo es 'OTRO'.
    severidad: severidadSchema,

    prioridad: z.string().trim().optional(),

    motivoOtro: z
        .string()
        .trim()
        .max(500)
        .optional()
        .nullable(),

    solicitud: nullableObjectIdSchema,

    conductor: nullableObjectIdSchema,

    usuarioRegistro: objectIdSchema,

    estadoNovedad: estadoNovedadSchema
        .default("POR_REVISAR")
        .optional(),

    ubicacion: z
        .union([
            z.object({
                lat: z.number().optional().nullable(),
                lng: z.number().optional().nullable(),
                latitude: z.number().optional().nullable(),
                longitude: z.number().optional().nullable(),
                direccion: z.string().optional().nullable()
            }),
            z.string(),
            z.null()
        ])
        .optional(),

    latitud: z.number().optional().nullable(),
    longitud: z.number().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),

    rutaInicial: z
        .object({
            origen: z.string().optional().nullable(),
            destino: z.string().optional().nullable(),
            coordenadas: z.array(z.any()).optional(),
            polyline: z.string().optional().nullable()
        })
        .optional(),

    rutaNueva: z
        .object({
            origen: z.string().optional().nullable(),
            destino: z.string().optional().nullable(),
            coordenadas: z.array(z.any()).optional(),
            polyline: z.string().optional().nullable()
        })
        .optional(),

    nuevoDestino: z.string().optional().nullable(),

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
                .max(1000, "Las observaciones no pueden superar los 1000 caracteres."),
            z.null()
        ])
        .optional()
        .default(null),

    notasResolucion: z
        .union([
            z
                .string()
                .trim()
                .max(1500, "Las notas de resolución no pueden superar los 1500 caracteres."),
            z.null()
        ])
        .optional()
        .default(null),

    evidenciaUrl: z
        .union([
            z.string().trim(),
            z.null()
        ])
        .optional()
        .default(null),

    fotosEvidencia: z
        .array(z.string().trim())
        .optional()
        .default([])
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
                .max(1500, "Las observaciones no pueden superar los 1500 caracteres."),
            z.null()
        ])
        .optional()
        .default(null)
});
