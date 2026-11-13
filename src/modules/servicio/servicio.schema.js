import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "El identificador tiene un formato invalido."
    );

export const obtenerPorSolicitudSchema = z.object({
    solicitudId: objectIdSchema
});

export const servicioIdSchema = z.object({
    id: objectIdSchema
});

export const imagenServicioSchema = z.object({
    url: z.string().url("La URL de la imagen debe ser válida."),
    public_id: z.string().min(1, "El public_id de la imagen es obligatorio."),
    formato: z.string().optional()
});

export const eliminarImagenServicioSchema = z.object({
    id: objectIdSchema,
    imagenId: objectIdSchema
});