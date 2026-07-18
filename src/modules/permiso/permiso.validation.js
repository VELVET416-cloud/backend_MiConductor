import { z } from "zod";

export const crearPermisoSchema = z.object({
    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .min(3, "El nombre debe tener mínimo 3 caracteres.")
        .max(100, "El nombre no puede superar los 100 caracteres."),

    codigo: z
        .string({
            required_error: "El código es obligatorio."
        })
        .min(3, "El código es obligatorio.")
        .regex(
            /^[a-z]+\.[a-z]+$/,
            "El código debe tener el formato modulo.accion (ej: usuarios.crear)"
        ),

    modulo: z
        .string({
            required_error: "El módulo es obligatorio."
        })
        .min(3, "El módulo es obligatorio."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .min(5, "La descripción debe tener mínimo 5 caracteres.")
        .max(250, "La descripción no puede superar los 250 caracteres."),

    activo: z.boolean().optional()
});

export const actualizarPermisoSchema = crearPermisoSchema.partial();