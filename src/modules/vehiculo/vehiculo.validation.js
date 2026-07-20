import { z } from "zod";

export const crearVehiculoSchema = z.object({
    placa: z
        .string({
            required_error: "La placa es obligatoria."
        })
        .trim()
        .toUpperCase()
        .min(3, "La placa debe tener mínimo 3 caracteres."),

    marca: z
        .string({
            required_error: "La marca es obligatoria."
        })
        .trim()
        .min(2, "La marca debe tener mínimo 2 caracteres."),

    modelo: z
        .string({
            required_error: "El modelo es obligatorio."
        })
        .trim()
        .min(1, "El modelo debe tener mínimo 1 carácter."),

    color: z
        .string({
            required_error: "El color es obligatorio."
        })
        .trim()
        .min(3, "El color debe tener mínimo 3 caracteres."),

    año: z
        .number({
            required_error: "El año es obligatorio."
        })
        .int()
        .min(1900, "El año debe ser mayor o igual a 1900.")
        .max(new Date().getFullYear() + 1, "El año no puede ser mayor a " + (new Date().getFullYear() + 1) + "."),

    tipoVehiculo: z
        .enum(["SEDAN", "SUV", "CAMIONETA", "MOTOCICLETA", "BUS", "CAMION"], {
            required_error: "El tipo de vehículo es obligatorio.",
            invalid_type_error: "El tipo de vehículo no es válido."
        }),

    numeroMotor: z
        .string({
            required_error: "El número de motor es obligatorio."
        })
        .trim()
        .min(5, "El número de motor debe tener mínimo 5 caracteres."),

    numeroChasis: z
        .string({
            required_error: "El número de chasis es obligatorio."
        })
        .trim()
        .min(5, "El número de chasis debe tener mínimo 5 caracteres."),

    soat: z
        .string({
            required_error: "La fecha de vencimiento del SOAT es obligatoria."
        })
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "La fecha de vencimiento del SOAT no es válida."
        }),

    tecnomecanica: z
        .string({
            required_error: "La fecha de vencimiento de la tecnomecánica es obligatoria."
        })
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "La fecha de vencimiento de la tecnomecánica no es válida."
        }),

    estado: z
        .enum(["ACTIVO", "INACTIVO", "EN_MANTENIMIENTO"])
        .optional()
        .default("ACTIVO"),

    conductor: z
        .string({
            required_error: "El conductor es obligatorio."
        })
        .trim(),

    activo: z
        .boolean()
        .optional()
        .default(true)
});

export const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export const actualizarEstadoVehiculoSchema = z.object({
    estado: z
        .enum(["ACTIVO", "INACTIVO", "EN_MANTENIMIENTO"], {
            required_error: "El estado es obligatorio.",
            invalid_type_error: "El estado no es válido."
        })
});
