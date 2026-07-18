import { z } from "zod";

export const crearRolSchema = z.object({
    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .min(3, "El nombre debe tener mínimo 3 caracteres.")
        .max(100, "El nombre no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .min(5, "La descripción debe tener mínimo 5 caracteres.")
        .max(250, "La descripción no puede superar los 250 caracteres."),

    permisos: z
        .array(z.string())
        .optional(),

    activo: z
        .boolean()
        .optional()
});

export const actualizarRolSchema = crearRolSchema.partial();