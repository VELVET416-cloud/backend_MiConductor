import { z } from "zod";

const permisoSchema = z.object({

    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .min(3, "El nombre debe tener mínimo 3 caracteres.")
        .max(100),

    codigo: z
        .string({
            required_error: "El código es obligatorio."
        })
        .min(3)
        .regex(
            /^[a-z]+\.[a-z]+$/,
            "El código debe tener el formato accion.modulo (ej: crear.usuarios)."
        ),

    modulo: z
        .string({
            required_error: "El módulo es obligatorio."
        })
        .min(3)
        .max(100),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .min(5)
        .max(250),

    activo: z.boolean().optional()

});

export const crearPermisoSchema = permisoSchema;

export const actualizarPermisoSchema =
    permisoSchema.partial();