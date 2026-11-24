import { z } from "zod";

const categoriasLicencia = [
    "A1",
    "A2",
    "B1",
    "B2",
    "B3",
    "C1",
    "C2",
    "C3"
];

const conductorBaseSchema = z.object({

    // DATOS DEL USUARIO

    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .trim()
        .min(2)
        .max(100),

    apellido: z
        .string({
            required_error: "El apellido es obligatorio."
        })
        .trim()
        .min(2)
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
        .trim(),

    correo: z
        .string({
            required_error: "El correo es obligatorio."
        })
        .email(),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .min(6),

    telefono: z
        .string({
            required_error: "El teléfono es obligatorio."
        }),

    // DATOS DEL CONDUCTOR

    licencia: z
        .string({
            required_error: "La licencia es obligatoria."
        })
        .trim()
        .min(5)
        .max(30),

    categoriaLicencia: z.enum(categoriasLicencia),

    fechaExpedicion: z.coerce.date(),

    fechaVencimiento: z.coerce.date(),

    experiencia: z
        .number()
        .min(0)
        .optional()
        .default(0),

    disponible: z
        .boolean()
        .optional(),

    estado: z
        .boolean()
        .optional()

});

export const crearConductorSchema =
    conductorBaseSchema.refine(

        (data) =>
            data.fechaVencimiento > data.fechaExpedicion,

        {
            message:
                "La fecha de vencimiento debe ser posterior a la fecha de expedición.",
            path: ["fechaVencimiento"]
        }

    );

export const actualizarConductorSchema =
    conductorBaseSchema.partial();

export const cambiarDisponibilidadSchema =
    z.object({

        disponible: z.boolean()

    });

export const actualizarLicenciaSchema =
    z.object({

        licencia: z
            .string()
            .trim()
            .min(5)
            .max(30),

        categoriaLicencia: z.enum(categoriasLicencia),

        fechaExpedicion: z.coerce.date(),

        fechaVencimiento: z.coerce.date()

    }).refine(

        (data) =>
            data.fechaVencimiento > data.fechaExpedicion,

        {
            message:
                "La fecha de vencimiento debe ser posterior a la fecha de expedición.",
            path: ["fechaVencimiento"]
        }

    );