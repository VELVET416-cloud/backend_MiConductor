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

    anio: z
        .number({
            required_error: "El año es obligatorio.",
            invalid_type_error: "El año debe ser un número."
        }),

    tipoVehiculo: z
        .string({
            required_error: "El tipo de vehículo es obligatorio."
        })
        .trim()
        .min(2, "El tipo de vehículo debe tener al menos 2 caracteres."),

    numeroPuertas: z
        .number({
            required_error: "El número de puertas es obligatorio.",
            invalid_type_error: "El número de puertas debe ser un número."
        }),

    tipoCombustible: z
        .string({
            required_error: "El tipo de combustible es obligatorio."
        })
        .trim()
        .min(2, "El tipo de combustible debe tener al menos 2 caracteres."),

    estadoSeguro: z
        .string({
            required_error: "El estado del seguro es obligatorio."
        })
        .trim()
        .min(2, "El estado del seguro debe tener al menos 2 caracteres."),

    companiaAseguradora: z
        .string({
            required_error: "La compañía aseguradora es obligatoria."
        })
        .trim()
        .min(2, "La compañía aseguradora debe tener al menos 2 caracteres."),

    fechaRevisionTecnicoMecanica: z
        .string()
        .datetime({ message: "La fecha de revisión técnico-mecánica debe ser una fecha válida." })
        .optional()
        .nullable(),

    gpsRastreo: z.boolean().optional(),
    airbags: z.boolean().optional(),
    frenosAbs: z.boolean().optional(),
    camaraTrasera: z.boolean().optional(),
    camaraInterior: z.boolean().optional(),

    tarjetaCirculacion: z.string().nullable().optional(),
    seguro: z.string().nullable().optional(),
    verificacion: z.string().nullable().optional(),
    certificadoTecnicoMecanica: z.string().nullable().optional(),
    certificadoSoat: z.string().nullable().optional(),

    foto: z
        .string()
        .trim()
        .nullable()
        .optional()

});

const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export {
    crearVehiculoSchema,
    actualizarVehiculoSchema
};