import { z } from "zod";
import {
    ALLOWED_DOCUMENT_TYPES,
    normalizeTipoDocumento,
    normalizeDocumento,
    validateDocumentoPorTipo
} from "../cliente/cliente.schema.js";

const crearUsuarioSchema = z
    .object({
        nombre: z
            .string({
                required_error: "El nombre es obligatorio.",
                error: "El nombre es obligatorio."
            })
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres.")
            .max(100, "El nombre no puede superar los 100 caracteres."),

        apellido: z
            .string({
                required_error: "El apellido es obligatorio.",
                error: "El apellido es obligatorio."
            })
            .trim()
            .min(2, "El apellido debe tener al menos 2 caracteres.")
            .max(100, "El apellido no puede superar los 100 caracteres."),

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
                required_error: "El documento es obligatorio.",
                error: "El documento es obligatorio."
            })
            .trim()
            .min(1, "El documento es obligatorio."),

        correo: z
            .string({
                required_error: "El correo es obligatorio.",
                error: "El correo es obligatorio."
            })
            .trim()
            .email("Debe ingresar un correo válido."),

        password: z
            .string({
                required_error: "La contraseña es obligatoria.",
                error: "La contraseña es obligatoria."
            })
            .min(6, "La contraseña debe tener al menos 6 caracteres."),

        telefono: z
            .string({
                required_error: "El teléfono es obligatorio.",
                error: "El teléfono es obligatorio."
            })
            .trim()
            .min(7, "El teléfono debe tener al menos 7 caracteres."),

        rol: z
            .string({
                required_error: "El rol es obligatorio.",
                error: "El rol es obligatorio."
            })
            .min(1, "El rol es obligatorio."),

        estado: z.boolean().optional(),
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

const actualizarUsuarioSchema = z
    .object({
        nombre: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        apellido: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        tipoDocumento: z
            .string()
            .trim()
            .refine((val) => ALLOWED_DOCUMENT_TYPES.includes(normalizeTipoDocumento(val)), {
                message: "Tipo de documento inválido. Debe ser CC, TI, CE, PPT o Pasaporte."
            })
            .optional(),

        documento: z
            .string()
            .trim()
            .min(5)
            .optional(),

        correo: z
            .string()
            .trim()
            .email("Debe ingresar un correo válido.")
            .optional(),

        password: z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres.")
            .optional(),

        telefono: z
            .string()
            .trim()
            .min(7)
            .optional(),

        rol: z
            .string()
            .min(1)
            .optional(),

        estado: z
            .boolean()
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.documento !== undefined && data.tipoDocumento !== undefined) {
            const tipoNorm = normalizeTipoDocumento(data.tipoDocumento);
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
        }
    });

export {
    crearUsuarioSchema,
    actualizarUsuarioSchema
};
