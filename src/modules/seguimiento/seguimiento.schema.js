import { z } from "zod";

// ==================================================
// VALIDACIÓN DE IDENTIFICADORES
// ==================================================

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "El identificador tiene un formato inválido."
    );

// ==================================================
// VALIDACIÓN DE COORDENADAS GPS
// ==================================================

const latSchema = z
    .number({
        required_error: "La latitud es obligatoria.",
        invalid_type_error: "La latitud debe ser un número.",
    })
    .min(-90, "La latitud mínima es -90.")
    .max(90, "La latitud máxima es 90.");

const lngSchema = z
    .number({
        required_error: "La longitud es obligatoria.",
        invalid_type_error: "La longitud debe ser un número.",
    })
    .min(-180, "La longitud mínima es -180.")
    .max(180, "La longitud máxima es 180.");

// ==================================================
// CREAR SEGUIMIENTO
// ==================================================

export const crearSeguimientoSchema = z.object({
    servicioId: objectIdSchema,
    conductorId: objectIdSchema,
});

// ==================================================
// VALIDAR UNA COORDENADA
// ==================================================

export const coordenadaSchema = z.object({
    lat: latSchema,
    lng: lngSchema,
});

// ==================================================
// VALIDAR PARÁMETROS DE SERVICIO
// ==================================================

export const servicioIdParamSchema = z.object({
    servicioId: objectIdSchema,
});

// ==================================================
// VALIDAR PARÁMETROS DE SEGUIMIENTO
// ==================================================

export const seguimientoIdParamSchema = z.object({
    id: objectIdSchema,
});

// ==================================================
// CONSULTAR RESUMEN DE SEGUIMIENTOS ACTIVOS
// ==================================================

export const activosResumenQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(20)
        .default(8),

    search: z
        .string()
        .trim()
        .max(
            50,
            "La búsqueda no puede superar los 50 caracteres."
        )
        .default(""),
});