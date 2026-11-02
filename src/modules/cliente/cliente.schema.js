import { z } from "zod";

const ONLY_DIGITS_REGEX = /^\d+$/;
const ALPHANUMERIC_REGEX = /^[0-9A-Za-z]+$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const ALLOWED_DOCUMENT_TYPES = ["CC", "TI", "CE", "PPT", "PA"];

export const DOCUMENT_RULES = {
    CC: {
        numericOnly: true,
        minLength: 6,
        maxLength: 10,
        regex: ONLY_DIGITS_REGEX,
        charError: "La Cédula de ciudadanía (CC) solo debe contener números, sin letras, espacios ni caracteres especiales.",
        lengthError: "La Cédula de ciudadanía (CC) debe tener entre 6 y 10 dígitos."
    },
    TI: {
        numericOnly: true,
        minLength: 10,
        maxLength: 11,
        regex: ONLY_DIGITS_REGEX,
        charError: "La Tarjeta de identidad (TI) solo debe contener números, sin letras, espacios ni caracteres especiales.",
        lengthError: "La Tarjeta de identidad (TI) debe tener entre 10 y 11 dígitos."
    },
    CE: {
        numericOnly: true,
        minLength: 6,
        maxLength: 7,
        regex: ONLY_DIGITS_REGEX,
        charError: "La Cédula de extranjería (CE) solo debe contener números, sin letras, espacios ni caracteres especiales.",
        lengthError: "La Cédula de extranjería (CE) debe tener entre 6 y 7 dígitos."
    },
    PPT: {
        numericOnly: true,
        minLength: 6,
        maxLength: 8,
        regex: ONLY_DIGITS_REGEX,
        charError: "El Permiso por Protección Temporal (PPT) solo debe contener números, sin letras, espacios ni caracteres especiales.",
        lengthError: "El Permiso por Protección Temporal (PPT) debe tener entre 6 y 8 dígitos."
    },
    PA: {
        numericOnly: false,
        minLength: 6,
        maxLength: 16,
        regex: ALPHANUMERIC_REGEX,
        charError: "El Pasaporte solo puede contener letras y números, sin espacios ni caracteres especiales.",
        lengthError: "El Pasaporte debe tener entre 6 y 16 caracteres alfanuméricos."
    }
};

export function normalizeTipoDocumento(val) {
    const upper = (val ?? "").toString().trim().toUpperCase();
    if (upper === "PASAPORTE" || upper === "PAS") {
        return "PA";
    }
    return upper;
}

export function normalizeDocumento(val, tipoDoc = "CC") {
    const trimmed = (val ?? "").toString().trim();
    const tipo = normalizeTipoDocumento(tipoDoc);
    if (tipo === "PA") {
        return trimmed.toUpperCase();
    }
    return trimmed;
}

export function validateTipoDocumentoValue(val) {
    const normalized = normalizeTipoDocumento(val);
    if (!normalized) {
        return "El tipo de documento es obligatorio.";
    }
    if (!ALLOWED_DOCUMENT_TYPES.includes(normalized)) {
        return "Tipo de documento inválido. Debe ser CC, TI, CE, PPT o Pasaporte.";
    }
    return "";
}

export function validateDocumentoPorTipo(val, tipoDoc) {
    const trimmed = (val ?? "").toString().trim();
    if (!trimmed) {
        return "El número de documento es obligatorio.";
    }

    const tipo = normalizeTipoDocumento(tipoDoc);
    const rule = DOCUMENT_RULES[tipo];

    if (!rule) {
        return "Tipo de documento inválido. Debe ser CC, TI, CE, PPT o Pasaporte.";
    }

    if (!rule.regex.test(trimmed)) {
        return rule.charError;
    }

    if (trimmed.length < rule.minLength || trimmed.length > rule.maxLength) {
        return rule.lengthError;
    }

    return "";
}

const crearClienteSchema = z
    .object({
        nombre: z
            .string({
                required_error: "El nombre es obligatorio.",
                error: "El nombre es obligatorio."
            })
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres.")
            .max(100, "El nombre no puede superar los 100 caracteres.")
            .regex(NAME_REGEX, "El nombre no puede contener números ni caracteres especiales."),

        apellido: z
            .string({
                required_error: "El apellido es obligatorio.",
                error: "El apellido es obligatorio."
            })
            .trim()
            .min(2, "El apellido debe tener al menos 2 caracteres.")
            .max(100, "El apellido no puede superar los 100 caracteres.")
            .regex(NAME_REGEX, "El apellido no puede contener números ni caracteres especiales."),

        tipoDocumento: z
            .string({
                required_error: "El tipo de documento es obligatorio.",
                error: "El tipo de documento es obligatorio."
            })
            .trim()
            .min(1, "El tipo de documento es obligatorio.")
            .refine((val) => ALLOWED_DOCUMENT_TYPES.includes(normalizeTipoDocumento(val)), {
                message: "Tipo de documento inválido. Debe ser CC, TI, CE, PPT o Pasaporte."
            }),

        documento: z
            .string({
                required_error: "El número de documento es obligatorio.",
                error: "El número de documento es obligatorio."
            })
            .trim()
            .min(1, "El número de documento es obligatorio."),

        correo: z
            .string({
                required_error: "El correo es obligatorio.",
                error: "El correo es obligatorio."
            })
            .trim()
            .min(1, "El correo es obligatorio.")
            .regex(EMAIL_REGEX, "Debe ingresar un correo válido."),

        password: z
            .string({
                required_error: "La contraseña es obligatoria.",
                error: "La contraseña es obligatoria."
            })
            .min(6, "La contraseña debe tener al menos 6 caracteres.")
            .refine((val) => val.trim().length > 0, {
                message: "La contraseña no puede estar compuesta solo por espacios."
            }),

        telefono: z
            .string({
                required_error: "El teléfono es obligatorio.",
                error: "El teléfono es obligatorio."
            })
            .trim()
            .min(7, "El teléfono debe tener al menos 7 dígitos.")
            .max(15, "El teléfono no puede superar los 15 dígitos.")
            .regex(/^[0-9+]+$/, "El teléfono solo puede contener números."),

        direccion: z
            .string({
                required_error: "La dirección es obligatoria.",
                error: "La dirección es obligatoria."
            })
            .trim()
            .min(5, "La dirección debe tener al menos 5 caracteres.")
            .max(200, "La dirección no puede superar los 200 caracteres."),

        rol: z.string().optional(),
        rolId: z.string().optional()
    })
    .superRefine((data, ctx) => {
        const tipoNorm = normalizeTipoDocumento(data.tipoDocumento);
        if (!ALLOWED_DOCUMENT_TYPES.includes(tipoNorm)) {
            return;
        }

        const docErr = validateDocumentoPorTipo(data.documento, tipoNorm);
        if (docErr) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["documento"],
                message: docErr
            });
        }
    })
    .transform((data) => {
        const tipoDocumento = normalizeTipoDocumento(data.tipoDocumento);
        const documento = normalizeDocumento(data.documento, tipoDocumento);
        return {
            ...data,
            tipoDocumento,
            documento,
            correo: data.correo.trim().toLowerCase()
        };
    });

const actualizarClienteSchema = z.object({
    direccion: z
        .string()
        .trim()
        .min(5)
        .max(200)
        .optional(),

    estado: z.boolean().optional()
});

export {
    crearClienteSchema,
    actualizarClienteSchema
};
