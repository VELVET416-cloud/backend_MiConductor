import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "El identificador tiene un formato invalido."
    );

const latSchema = z
    .number({
        required_error: "La latitud es obligatoria.",
        invalid_type_error: "La latitud debe ser un numero."
    })
    .min(-90, "La latitud minima es -90.")
    .max(90, "La latitud maxima es 90.");

const lngSchema = z
    .number({
        required_error: "La longitud es obligatoria.",
        invalid_type_error: "La longitud debe ser un numero."
    })
    .min(-180, "La longitud minima es -180.")
    .max(180, "La longitud maxima es 180.");

export const crearSeguimientoSchema = z.object({
    servicioId: objectIdSchema,
    conductorId: objectIdSchema
});

export const coordenadaSchema = z.object({
    lat: latSchema,
    lng: lngSchema
});

export const servicioIdParamSchema = z.object({
    servicioId: objectIdSchema
});

export const seguimientoIdParamSchema = z.object({
    id: objectIdSchema
});