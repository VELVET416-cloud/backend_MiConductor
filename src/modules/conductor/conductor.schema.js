import { z } from "zod";

const categoriasLicenciaValidas = [
    "A1",
    "A2",
    "B1",
    "B2",
    "B3",
    "C1",
    "C2",
    "C3"
];

const licenciaItemSchema = z.object({
    numero: z.string().trim().optional(),
    categoria: z.string().trim().optional(),
    categorias: z.array(z.string()).optional(),
    fechaExpedicion: z.coerce.date().optional().nullable(),
    fechaVencimiento: z.coerce.date().optional().nullable(),
    lugarExpedicion: z.string().trim().optional().nullable(),
    fotoLicencia: z.string().trim().optional().nullable()
});

const conductorBaseSchema = z.object({
    // DATOS DE IDENTIDAD / USUARIO
    nombre: z
        .string({
            required_error: "El nombre es obligatorio."
        })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(100)
        .optional(),

    apellido: z
        .string({
            required_error: "El apellido es obligatorio."
        })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres.")
        .max(100)
        .optional(),

    nombreCompleto: z.string().optional(),

    tipoDocumento: z
        .string({
            required_error: "El tipo de documento es obligatorio."
        })
        .trim()
        .min(1, "El tipo de documento es obligatorio."),

    documento: z
        .string({
            required_error: "El documento es obligatorio."
        })
        .trim()
        .min(1, "El documento es obligatorio."),

    correo: z
        .string({
            required_error: "El correo electrónico es obligatorio."
        })
        .trim()
        .email("Debe ingresar un correo electrónico válido."),

    password: z.string().min(6).optional(),

    telefono: z
        .string({
            required_error: "El teléfono es obligatorio."
        })
        .trim()
        .min(7, "El teléfono debe tener al menos 7 dígitos."),

    telefonoEmergencia: z.string().trim().optional().nullable(),
    fechaNacimiento: z.string().optional().nullable(),
    edad: z.union([z.number(), z.string()]).optional().nullable(),

    // DATOS DEL CONDUCTOR Y LICENCIA
    licencia: z
        .string()
        .trim()
        .min(3, "El número de licencia debe tener al menos 3 caracteres.")
        .max(30)
        .optional(),

    categoriaLicencia: z.string().trim().optional(),

    categoriasLicencia: z
        .union([
            z.array(z.string()),
            z.string()
        ])
        .optional(),

    fechaExpedicion: z.coerce.date().optional().nullable(),
    fechaVencimiento: z.coerce.date().optional().nullable(),

    licencias: z.array(licenciaItemSchema).optional().default([]),

    experiencia: z
        .union([z.number(), z.string()])
        .optional()
        .default(0),

    disponible: z.boolean().optional(),

    estadoConductor: z
        .enum(["ACTIVO", "INACTIVO", "RETIRADO", "FALLECIDO"])
        .optional(),

    estado: z.boolean().optional(),

    fotoLicencia: z.string().optional().nullable(),
    fotoPerfil: z.string().optional().nullable()
});

export const crearConductorSchema = conductorBaseSchema.refine(
    (data) => {
        if (data.fechaVencimiento && data.fechaExpedicion) {
            return new Date(data.fechaVencimiento) > new Date(data.fechaExpedicion);
        }
        return true;
    },
    {
        message: "La fecha de vencimiento debe ser posterior a la fecha de expedición.",
        path: ["fechaVencimiento"]
    }
);

export const actualizarConductorSchema = conductorBaseSchema.partial();

export const cambiarDisponibilidadSchema = z.object({
    disponible: z.boolean({
        required_error: "El campo disponible es obligatorio."
    })
});

export const cambiarEstadoAdministrativoSchema = z.object({
    estadoConductor: z.enum(["ACTIVO", "INACTIVO", "RETIRADO", "FALLECIDO"], {
        required_error: "El estado administrativo es obligatorio."
    }),
    motivo: z.string().trim().optional()
});

export const actualizarLicenciaSchema = z
    .object({
        licencia: z.string().trim().min(3).max(30).optional(),
        categoriaLicencia: z.string().trim().optional(),
        categoriasLicencia: z.union([z.array(z.string()), z.string()]).optional(),
        fechaExpedicion: z.coerce.date().optional(),
        fechaVencimiento: z.coerce.date().optional(),
        licencias: z.array(licenciaItemSchema).optional(),
        fotoLicencia: z.string().optional().nullable()
    })
    .refine(
        (data) => {
            if (data.fechaVencimiento && data.fechaExpedicion) {
                return new Date(data.fechaVencimiento) > new Date(data.fechaExpedicion);
            }
            return true;
        },
        {
            message: "La fecha de vencimiento debe ser posterior a la fecha de expedición.",
            path: ["fechaVencimiento"]
        }
    );
