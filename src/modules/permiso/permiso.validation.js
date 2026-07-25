import { z } from "zod";

const roles = [
    "ADMINISTRADOR",
    "CONDUCTOR",
    "CLIENTE"
];

const permisoSchema = z.object({

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
            "El código debe tener el formato accion.modulo (ej: crear.usuarios)."
        ),

    modulo: z
        .string({
            required_error: "El módulo es obligatorio."
        })
        .min(3, "El módulo es obligatorio.")
        .max(100, "El módulo no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .min(5, "La descripción debe tener mínimo 5 caracteres.")
        .max(250, "La descripción no puede superar los 250 caracteres."),

    rolesPermitidos: z
        .array(
            z.enum(roles)
        )
        .min(1, "Debe asignar al menos un rol."),

    activo: z.boolean().optional()

});

export const crearPermisoSchema = permisoSchema;

export const actualizarPermisoSchema = permisoSchema.partial();