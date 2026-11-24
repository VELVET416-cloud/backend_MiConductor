import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const estadosSolicitud = [
    "PENDIENTE",
    "EN_PROCESO",
    "COMPLETADO",
    "CANCELADO"
];

const prioridadesSolicitud = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "URGENTE"
];

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "Uno o más identificadores tienen un formato inválido."
    );

const estadoSchema = z
    .string({
        required_error: "El estado es obligatorio."
    })
    .trim()
    .transform(estado => estado.toUpperCase())
    .refine(
        estado => estadosSolicitud.includes(estado),
        "El estado enviado no es válido."
    );

const prioridadSchema = z
    .string({
        required_error: "La prioridad es obligatoria."
    })
    .trim()
    .transform(prioridad => prioridad.toUpperCase())
    .refine(
        prioridad => prioridadesSolicitud.includes(prioridad),
        "La prioridad enviada no es válida."
    );

const FAKE_ADDRESS_REGEX =
    /calle\s+falsa|carrera\s+falsa|123\s*#\s*123|0+\s*#\s*0+|asdf|qwerty|sin\s+direcci[oó]n|ninguna|casa\s+de\s+mi\s+mam[aá]|casa\s+m[ií]a|prueba\s*123|test\s*123|direccion\s+falsa/i;

const COLOMBIA_ROAD_PREFIX =
    "(?:calle|cll\\.?|cl\\.?|carrera|cra\\.?|cr\\.?|kr\\.?|k\\.?|circular|cir\\.?|cq\\.?|diagonal|diag\\.?|dg\\.?|transversal|transv\\.?|tv\\.?|tr\\.?|avenida|avda\\.?|av\\.?|autopista|auto\\.?|loma|pasaje|kil[oó]metro|km\\.?|v[ií]a|variante|camino|vereda|vda\\.?)";

const COLOMBIA_ADDRESS_REGEX = new RegExp(
    `\\b${COLOMBIA_ROAD_PREFIX}\\s*(?:\\d{1,3}[a-zA-Z]?(?:\\s*(?:bis|sur|norte|este|oeste|oriente|occidente|[a-zA-Z]))?|[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}(?:\\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})?)(?:\\s*(?:#|no\\.?|nro\\.?|n[°º]|-|\\s)\\s*\\d{1,3}[a-zA-Z]?(?:\\s*(?:bis|sur|norte|este|oeste|oriente|occidente|[a-zA-Z]))?\\s*(?:-|a|\\s)\\s*\\d{1,4}|\\s*\\d{1,3})`,
    "i"
);

const crearDireccionSchema = (nombreCampo) =>
    z
        .string({
            required_error: `El ${nombreCampo} es obligatorio.`
        })
        .trim()
        .min(8, `Ingresa una dirección de ${nombreCampo} completa (mínimo 8 caracteres).`)
        .max(200, `El ${nombreCampo} no puede superar los 200 caracteres.`)
        .refine(
            val => !FAKE_ADDRESS_REGEX.test(val),
            `Ingresa una dirección de ${nombreCampo} real y verificable.`
        )
        .refine(
            val => COLOMBIA_ADDRESS_REGEX.test(val),
            `Usa nomenclatura vial colombiana válida en el ${nombreCampo} (ej: Calle 10 # 43A-30 o Cra 70 # 44B-12).`
        );

const solicitudBaseSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres.")
        .max(50, "El código no puede superar los 50 caracteres.")
        .transform(codigo => codigo.toUpperCase())
        .optional(),

    cliente: objectIdSchema,

    correoCliente: z
        .string({
            required_error: "El correo del cliente es obligatorio."
        })
        .trim()
        .email("El correo del cliente no es válido.")
        .transform(correo => correo.toLowerCase()),

    conductorAsignado: objectIdSchema.optional(),

    vehiculo: objectIdSchema.optional(),

    tipoServicio: z
        .string({
            required_error: "El tipo de servicio es obligatorio."
        })
        .trim()
        .min(3, "El tipo de servicio debe tener al menos 3 caracteres.")
        .max(100, "El tipo de servicio no puede superar los 100 caracteres."),

    descripcion: z
        .string({
            required_error: "La descripción es obligatoria."
        })
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres.")
        .max(500, "La descripción no puede superar los 500 caracteres."),

    origen: crearDireccionSchema("origen"),

    destino: crearDireccionSchema("destino"),

    fechaProgramada: z.coerce.date().optional(),

    prioridad: prioridadSchema.default("MEDIA").optional(),

    calificacionConductor: z.number().int().min(1).max(5).optional().nullable(),

    comentarioCliente: z.string().trim().max(1000).optional().nullable(),

    comentarioConductor: z.string().trim().max(1000).optional().nullable(),

    destinoInicial: z.string().trim().optional().nullable(),

    cambioRuta: z.any().optional().nullable(),

    motivo: z.string().trim().optional().nullable(),

    nuevoDestino: z.string().trim().optional().nullable()
});

export const crearSolicitudSchema = solicitudBaseSchema;

export const actualizarSolicitudSchema = solicitudBaseSchema
    .partial()
    .extend({
        estado: estadoSchema.optional()
    });

export const asignarConductorSchema = z.object({
    conductorAsignado: objectIdSchema
});