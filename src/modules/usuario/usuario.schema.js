import { z } from "zod";
import {
    ALLOWED_DOCUMENT_TYPES,
    normalizeTipoDocumento,
    normalizeDocumento,
    validateDocumentoPorTipo
} from "../cliente/cliente.schema.js";

const crearUsuarioSchema = z
    .object({
        nombreCompleto: z.string().optional(),

        nombre: z.string().trim().optional(),

        apellido: z.string().trim().optional(),

        fechaNacimiento: z.string().optional().nullable(),

        edad: z.union([z.number(), z.string()]).optional().nullable(),

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

        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),

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
        let nombre = data.nombre;
        let apellido = data.apellido;
        if (data.nombreCompleto && (!nombre || !apellido)) {
            const parts = data.nombreCompleto.trim().split(/\s+/);
            nombre = parts[0] || "";
            apellido = parts.slice(1).join(" ") || parts[0] || "";
        }
        if (!nombre || nombre.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["nombreCompleto"],
                message: "El nombre debe tener al menos 2 caracteres."
            });
        }
        if (!apellido || apellido.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["nombreCompleto"],
                message: "Debe ingresar al menos un apellido."
            });
        }

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
        let nombre = data.nombre;
        let apellido = data.apellido;
        if (data.nombreCompleto && (!nombre || !apellido)) {
            const parts = data.nombreCompleto.trim().split(/\s+/);
            nombre = parts[0] || "";
            apellido = parts.slice(1).join(" ") || parts[0] || "";
        }
        return {
            ...data,
            nombre,
            apellido,
            tipoDocumento,
            documento,
            correo: data.correo.trim().toLowerCase()
        };
    });

const actualizarUsuarioSchema = z
    .object({
        nombreCompleto: z.string().optional(),

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

        fechaNacimiento: z.string().optional().nullable(),

        edad: z.union([z.number(), z.string()]).optional().nullable(),

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
