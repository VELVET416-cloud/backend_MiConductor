import { z } from "zod";

const crearUsuarioSchema = z.object({

    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(100, "El nombre no puede superar los 100 caracteres."),

    apellido: z
        .string({
            required_error: "El apellido es obligatorio."
        })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres.")
        .max(100, "El apellido no puede superar los 100 caracteres."),

    tipoDocumento: z
        .string({
            required_error: "El tipo de documento es obligatorio."
        })
        .trim()
        .min(2),

    documento: z
        .string({
            required_error: "El documento es obligatorio."
        })
        .trim()
        .min(5, "El documento debe tener al menos 5 caracteres."),

    correo: z
        .string({
            required_error: "El correo es obligatorio."
        })
        .email("Debe ingresar un correo válido."),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .min(6, "La contraseña debe tener al menos 6 caracteres."),

    telefono: z
        .string({
            required_error: "El teléfono es obligatorio."
        })
        .trim()
        .min(7, "El teléfono debe tener al menos 7 caracteres."),

    rol: z
        .string({
            required_error: "El rol es obligatorio."
        })
});

const actualizarUsuarioSchema = crearUsuarioSchema.partial();

export {
    crearUsuarioSchema,
    actualizarUsuarioSchema
};