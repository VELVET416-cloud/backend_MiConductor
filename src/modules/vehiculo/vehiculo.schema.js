import { z } from "zod";

const crearVehiculoSchema = z.object({

    cliente: z
        .string({
            required_error: "El cliente es obligatorio."
        }),

    marca: z
        .string({
            required_error: "La marca es obligatoria."
        })
        .trim()
        .min(2, "La marca debe tener al menos 2 caracteres.")
        .max(100, "La marca no puede superar los 100 caracteres."),

    modelo: z
        .string({
            required_error: "El modelo es obligatorio."
        })
        .trim()
        .min(2, "El modelo debe tener al menos 2 caracteres.")
        .max(100, "El modelo no puede superar los 100 caracteres."),

    placa: z
        .string({
            required_error: "La placa es obligatoria."
        })
        .trim()
        .min(5, "La placa debe tener al menos 5 caracteres.")
        .max(10, "La placa no puede superar los 10 caracteres."),

    numeroChasis: z
        .string({
            required_error: "El número de chasis es obligatorio."
        })
        .trim()
        .min(5, "El número de chasis debe tener al menos 5 caracteres.")
        .max(100, "El número de chasis no puede superar los 100 caracteres."),

    color: z
        .string({
            required_error: "El color es obligatorio."
        })
        .trim()
        .min(3, "El color debe tener al menos 3 caracteres.")
        .max(50, "El color no puede superar los 50 caracteres."),

    foto: z
        .string()
        .trim()
        .optional()

});

const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export {
    crearVehiculoSchema,
    actualizarVehiculoSchema
};