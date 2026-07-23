import { z } from "zod";

const crearClienteSchema = z.object({

    usuario: z
        .string({
            required_error: "El usuario es obligatorio."
        }),

    direccion: z
        .string({
            required_error: "La dirección es obligatoria."
        })
        .trim()
        .min(5, "La dirección debe tener al menos 5 caracteres.")
        .max(200, "La dirección no puede superar los 200 caracteres.")

});

const actualizarClienteSchema = crearClienteSchema.partial();

export {
    crearClienteSchema,
    actualizarClienteSchema
};