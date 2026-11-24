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