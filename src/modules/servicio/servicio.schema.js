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