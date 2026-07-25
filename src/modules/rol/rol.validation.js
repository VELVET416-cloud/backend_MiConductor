import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const rolSchema = z.object({

    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .trim()
        .min(3, "El nombre debe tener mínimo 3 caracteres.")
        .max(100, "El nombre no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .trim()
        .min(5, "La descripción debe tener mínimo 5 caracteres.")
        .max(250, "La descripción no puede superar los 250 caracteres."),

    permisos: z
        .array(
            z
                .string()
                .regex(
                    objectIdRegex,
                    "Uno o más permisos tienen un ID inválido."
                )
        )
        .default([])
        .transform(permisos => [...new Set(permisos)]),

    activo: z
        .boolean()
        .optional()

});

export const crearRolSchema = rolSchema;

export const actualizarRolSchema = rolSchema.partial();