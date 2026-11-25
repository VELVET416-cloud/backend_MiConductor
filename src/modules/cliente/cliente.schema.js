import { z } from "zod";

const ONLY_DIGITS_REGEX = /^\d+$/;
const ALPHANUMERIC_REGEX = /^[0-9A-Za-z]+$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const CELULAR_COLOMBIA_REGEX = /^3\d{9}$/;
const PASSWORD_UPPER_REGEX = /[A-ZÁÉÍÓÚÑ]/;
const PASSWORD_LOWER_REGEX = /[a-záéíóúñ]/;
const PASSWORD_NUMBER_REGEX = /\d/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~¡¿]/;

export const FIELD_LIMITS = {
    nombre: { min: 2, max: 50 },
    apellido: { min: 2, max: 50 },
    correo: { min: 5, max: 100 },
    telefono: { min: 10, max: 10 },
    direccion: { min: 5, max: 120 },
    password: { min: 8, max: 64 }
};

export function validateStrongPassword(password) {
    const pwd = typeof password === "string" ? password : "";
    if (!pwd) return "La contraseña es obligatoria.";
    if (/\s/.test(pwd)) return "La contraseña no puede contener espacios.";
    if (pwd.length < FIELD_LIMITS.password.min) {
        return `La contraseña debe tener al menos ${FIELD_LIMITS.password.min} caracteres.`;
    }
    if (pwd.length > FIELD_LIMITS.password.max) {
        return `La contraseña no puede superar los ${FIELD_LIMITS.password.max} caracteres.`;
    }
    if (!PASSWORD_UPPER_REGEX.test(pwd)) {
        return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!PASSWORD_LOWER_REGEX.test(pwd)) {
        return "La contraseña debe incluir al menos una letra minúscula.";
    }
    if (!PASSWORD_NUMBER_REGEX.test(pwd)) {
        return "La contraseña debe incluir al menos un número.";
    }
    if (!PASSWORD_SPECIAL_REGEX.test(pwd)) {
        return "La contraseña debe incluir al menos un carácter especial.";
    }
    return "";
}

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

export function validateMayorDeEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "La fecha de nacimiento es obligatoria.";
    const cleanStr = String(fechaNacimiento).split("T")[0];
    const parts = cleanStr.split("-");
    const fecha =
        parts.length === 3
            ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            : new Date(fechaNacimiento);
    if (isNaN(fecha.getTime())) return "Fecha de nacimiento inválida.";
    if (
        parts.length === 3 &&
        (fecha.getFullYear() !== Number(parts[0]) ||
            fecha.getMonth() !== Number(parts[1]) - 1 ||
            fecha.getDate() !== Number(parts[2]))
    ) {
        return "Fecha de nacimiento inválida.";
    }
    const hoy = new Date();
    const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (fechaSinHora > hoySinHora) return "La fecha de nacimiento no puede ser futura.";
    let edad = hoySinHora.getFullYear() - fechaSinHora.getFullYear();
    const m = hoySinHora.getMonth() - fechaSinHora.getMonth();
    if (m < 0 || (m === 0 && hoySinHora.getDate() < fechaSinHora.getDate())) {
        edad--;
    }
    if (edad < 18) {
        return `El cliente debe ser mayor de edad (mínimo 18 años). Edad actual: ${edad} años.`;
    }
    if (edad > 120) {
        return "Fecha de nacimiento inválida.";
    }
    return "";
}

export function calcularEdadNumero(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const cleanStr = String(fechaNacimiento).split("T")[0];
    const parts = cleanStr.split("-");
    const fecha =
        parts.length === 3
            ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            : new Date(fechaNacimiento);
    if (isNaN(fecha.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }
    return edad >= 0 && edad <= 120 ? edad : null;
}

const crearClienteBaseShape = {
    nombre: z
        .string({
            required_error: "El nombre es obligatorio.",
            error: "El nombre es obligatorio."
        })
        .trim()
        .min(FIELD_LIMITS.nombre.min, `El nombre debe tener al menos ${FIELD_LIMITS.nombre.min} caracteres.`)
        .max(FIELD_LIMITS.nombre.max, `El nombre no puede superar los ${FIELD_LIMITS.nombre.max} caracteres.`)
        .regex(NAME_REGEX, "El nombre no puede contener números ni caracteres especiales."),

    apellido: z
        .string({
            required_error: "El apellido es obligatorio.",
            error: "El apellido es obligatorio."
        })
        .trim()
        .min(FIELD_LIMITS.apellido.min, `El apellido debe tener al menos ${FIELD_LIMITS.apellido.min} caracteres.`)
        .max(FIELD_LIMITS.apellido.max, `El apellido no puede superar los ${FIELD_LIMITS.apellido.max} caracteres.`)
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
        .min(FIELD_LIMITS.correo.min, "El correo es obligatorio.")
        .max(FIELD_LIMITS.correo.max, `El correo no puede superar los ${FIELD_LIMITS.correo.max} caracteres.`)
        .regex(EMAIL_REGEX, "Debe ingresar un correo válido."),

    password: z
        .string({
            required_error: "La contraseña es obligatoria."
        })
        .optional(),

    telefono: z
        .string({
            required_error: "El teléfono es obligatorio.",
            error: "El teléfono es obligatorio."
        })
        .trim()
        .length(10, "El teléfono debe ser un celular colombiano de 10 dígitos.")
        .regex(CELULAR_COLOMBIA_REGEX, "El teléfono debe ser un celular colombiano de 10 dígitos que empiece por 3."),

    direccion: z
        .string({
            required_error: "La dirección es obligatoria.",
            error: "La dirección es obligatoria."
        })
        .trim()
        .min(FIELD_LIMITS.direccion.min, `La dirección debe tener al menos ${FIELD_LIMITS.direccion.min} caracteres.`)
        .max(FIELD_LIMITS.direccion.max, `La dirección no puede superar los ${FIELD_LIMITS.direccion.max} caracteres.`),

    fechaNacimiento: z.string().trim().optional(),
    edad: z.number().nullable().optional(),
    aceptaTerminos: z.boolean().optional(),
    fechaAceptacionTerminos: z.string().datetime({ offset: true }).optional().or(z.string().optional()),

    foto: z.string().nullable().optional(),

    rol: z.string().optional(),
    rolId: z.string().optional()
};

const crearClienteSchema = z
    .object(crearClienteBaseShape)
    .superRefine((data, ctx) => {
        const tipoNorm = normalizeTipoDocumento(data.tipoDocumento);
        if (tipoNorm === "TI") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["tipoDocumento"],
                message: "La Tarjeta de Identidad (TI) es solo para menores de edad. Los clientes deben ser mayores de edad (mínimo 18 años)."
            });
        }

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

        if (data.fechaNacimiento) {
            const edadErr = validateMayorDeEdad(data.fechaNacimiento);
            if (edadErr) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["fechaNacimiento"],
                    message: edadErr
                });
            }
        }
    })
    .transform((data) => {
        const tipoDocumento = normalizeTipoDocumento(data.tipoDocumento);
        const documento = normalizeDocumento(data.documento, tipoDocumento);
        const edad = data.edad ?? calcularEdadNumero(data.fechaNacimiento);
        return {
            ...data,
            tipoDocumento,
            documento,
            edad,
            correo: data.correo.trim().toLowerCase()
        };
    });

const registrarClienteSchema = z
    .object({
        ...crearClienteBaseShape,
        fechaNacimiento: z
            .string({
                required_error: "La fecha de nacimiento es obligatoria.",
                error: "La fecha de nacimiento es obligatoria."
            })
            .trim()
            .min(1, "La fecha de nacimiento es obligatoria."),
        password: z
            .string({
                required_error: "La contraseña es obligatoria.",
                error: "La contraseña es obligatoria."
            })
            .min(1, "La contraseña es obligatoria."),
        aceptaTerminos: z
            .boolean({
                required_error: "Debes aceptar los términos y condiciones y la política de tratamiento de datos personales.",
                error: "Debes aceptar los términos y condiciones y la política de tratamiento de datos personales."
            })
            .refine((val) => val === true, {
                message: "Debes aceptar los términos y condiciones y la política de tratamiento de datos personales."
            })
    })
    .superRefine((data, ctx) => {
        const tipoNorm = normalizeTipoDocumento(data.tipoDocumento);
        if (tipoNorm === "TI") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["tipoDocumento"],
                message: "La Tarjeta de Identidad (TI) es solo para menores de edad. Los clientes deben ser mayores de edad (mínimo 18 años)."
            });
        }

        if (ALLOWED_DOCUMENT_TYPES.includes(tipoNorm)) {
            const docErr = validateDocumentoPorTipo(data.documento, tipoNorm);
            if (docErr) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["documento"],
                    message: docErr
                });
            }
        }

        const edadErr = validateMayorDeEdad(data.fechaNacimiento);
        if (edadErr) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fechaNacimiento"],
                message: edadErr
            });
        }

        const pwdErr = validateStrongPassword(data.password);
        if (pwdErr) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: pwdErr
            });
        }
    })
    .transform((data) => {
        const tipoDocumento = normalizeTipoDocumento(data.tipoDocumento);
        const documento = normalizeDocumento(data.documento, tipoDocumento);
        const edad = calcularEdadNumero(data.fechaNacimiento);
        return {
            ...data,
            tipoDocumento,
            documento,
            edad,
            aceptaTerminos: true,
            fechaAceptacionTerminos: new Date(),
            correo: data.correo.trim().toLowerCase()
        };
    });

const actualizarClienteSchema = z
    .object({
        direccion: z
            .string()
            .trim()
            .min(5, "La dirección debe tener al menos 5 caracteres.")
            .max(200)
            .optional(),

        foto: z.string().nullable().optional(),

        nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(100).optional(),
        apellido: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres.").max(100).optional(),
        tipoDocumento: z.string().trim().optional(),
        documento: z.string().trim().optional(),
        telefono: z.string().trim().min(7, "El teléfono debe tener al menos 7 dígitos.").max(15).optional(),
        correo: z.string().trim().regex(EMAIL_REGEX, "Debe ingresar un correo válido.").optional(),
        fechaNacimiento: z.string().trim().optional(),
        edad: z.number().nullable().optional(),

        estado: z.boolean().optional()
    })
    .superRefine((data, ctx) => {
        if (data.tipoDocumento !== undefined) {
            const tipoNorm = normalizeTipoDocumento(data.tipoDocumento);
            if (tipoNorm === "TI") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["tipoDocumento"],
                    message: "La Tarjeta de Identidad (TI) es solo para menores de edad. Los clientes deben ser mayores de edad (mínimo 18 años)."
                });
            }
            if (data.documento !== undefined && ALLOWED_DOCUMENT_TYPES.includes(tipoNorm)) {
                const docErr = validateDocumentoPorTipo(data.documento, tipoNorm);
                if (docErr) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["documento"],
                        message: docErr
                    });
                }
            }
        }
        if (data.fechaNacimiento) {
            const edadErr = validateMayorDeEdad(data.fechaNacimiento);
            if (edadErr) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["fechaNacimiento"],
                    message: edadErr
                });
            }
        }
    })
    .transform((data) => {
        let tipoDocumento = data.tipoDocumento ? normalizeTipoDocumento(data.tipoDocumento) : undefined;
        let documento = data.documento && tipoDocumento ? normalizeDocumento(data.documento, tipoDocumento) : data.documento;
        let edad = data.edad ?? (data.fechaNacimiento ? calcularEdadNumero(data.fechaNacimiento) : undefined);
        return {
            ...data,
            ...(tipoDocumento ? { tipoDocumento } : {}),
            ...(documento ? { documento } : {}),
            ...(edad !== undefined ? { edad } : {}),
            ...(data.correo ? { correo: data.correo.trim().toLowerCase() } : {})
        };
    });

export {
    crearClienteSchema,
    registrarClienteSchema,
    actualizarClienteSchema
};
