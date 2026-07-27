import { z } from "zod";

const crearClienteSchema = z.object({

    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(100),

    apellido: z
        .string({
            required_error: "El apellido es obligatorio."
        })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres.")
        .max(100),

    tipoDocumento: z
        .string({
            required_error: "El tipo de documento es obligatorio."
        })
        .trim(),

    documento: z
        .string({
            required_error: "El documento es obligatorio."
        })
        .trim()
        .min(5),

    correo: z
        .string({
            required_error: "El correo es obligatorio."
        })
        .email("Debe ingresar un correo válido."),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .min(6),

    telefono: z
        .string({
            required_error: "El teléfono es obligatorio."
        })
        .trim()
        .min(7),

    direccion: z
        .string({
            required_error: "La dirección es obligatoria."
        })
        .trim()
        .min(5, "La dirección debe tener al menos 5 caracteres.")
        .max(200, "La dirección no puede superar los 200 caracteres.")

});

const actualizarClienteSchema = z.object({

    direccion: z
        .string()
        .trim()
        .min(5)
        .max(200)
        .optional()

});

export {
    crearClienteSchema,
    actualizarClienteSchema
};