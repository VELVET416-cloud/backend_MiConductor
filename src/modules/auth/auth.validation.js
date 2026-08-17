import { z } from "zod";

export const loginSchema = z.object({

    correo: z
        .string({
            required_error: "El correo es obligatorio."
        })
        .email("Debe ingresar un correo válido."),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .min(6, "La contraseña debe tener mínimo 6 caracteres.")

});


export const forgotPasswordSchema = z.object({

    correo: z
        .string({
            required_error: "El correo es obligatorio."
        })
        .email("Debe ingresar un correo válido.")

});

export const resetPasswordSchema = z.object({

    token: z
        .string({
            required_error: "El token es obligatorio."
        })
        .min(1),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .min(
            6,
            "La contraseña debe tener mínimo 6 caracteres."
        )

});