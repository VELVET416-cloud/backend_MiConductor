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
        .string()
        .trim()
        .optional()
        .nullable(),

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
        .number()
        .optional()
        .nullable(),

    tipoCombustible: z
        .string()
        .trim()
        .optional()
        .nullable(),

    estadoSeguro: z
        .string()
        .trim()
        .optional()
        .nullable(),

    companiaAseguradora: z
        .string()
        .trim()
        .optional()
        .nullable(),

    fechaRevisionTecnicoMecanica: z
        .string()
        .optional()
        .nullable(),

    fechaVencimientoSoat: z
        .string()
        .optional()
        .nullable(),

    fechaVencimientoTecnomecanica: z
        .string()
        .optional()
        .nullable(),

    tarjetaPropiedad: z.string().nullable().optional(),
    fotos: z.array(z.string()).optional(),
    foto1: z.string().nullable().optional(),
    foto2: z.string().nullable().optional(),
    foto3: z.string().nullable().optional(),

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
        .optional(),

    estado: z.boolean().optional()

});

const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export {
    crearVehiculoSchema,
    actualizarVehiculoSchema
};