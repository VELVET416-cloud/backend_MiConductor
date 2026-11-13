import { z } from "zod";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginSchema = z
    .object({
        correo: z
            .string({
                required_error: "El correo es obligatorio.",
                invalid_type_error: "El correo debe ser una cadena de texto.",
                error: "El correo es obligatorio."
            })
            .optional()
            .default(""),

        password: z
            .string({
                required_error: "La contraseña es obligatoria.",
                invalid_type_error: "La contraseña debe ser una cadena de texto.",
                error: "La contraseña es obligatoria."
            })
            .optional()
            .default("")
    })
    .superRefine((data, ctx) => {
        const correo = (data.correo || "").trim();
        if (!correo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["correo"],
                message: "El correo es obligatorio."
            });
        } else if (!EMAIL_REGEX.test(correo)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["correo"],
                message: "Debe ingresar un correo válido."
            });
        }

        const password = data.password || "";
        if (!password || !password.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "La contraseña es obligatoria."
            });
        } else if (password.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "La contraseña debe tener mínimo 6 caracteres."
            });
        }
    })
    .transform((data) => ({
        correo: data.correo.trim().toLowerCase(),
        password: data.password
    }));


export const forgotPasswordSchema = z
    .object({
        correo: z
            .string({
                required_error: "El correo es obligatorio.",
                invalid_type_error: "El correo debe ser una cadena de texto.",
                error: "El correo es obligatorio."
            })
            .optional()
            .default(""),

        origen: z.enum(["web", "mobile"]).default("web")
    })
    .superRefine((data, ctx) => {
        const correo = (data.correo || "").trim();
        if (!correo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["correo"],
                message: "El correo es obligatorio."
            });
        } else if (!EMAIL_REGEX.test(correo)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["correo"],
                message: "Debe ingresar un correo válido."
            });
        }
    })
    .transform((data) => ({
        correo: data.correo.trim().toLowerCase(),
        origen: data.origen
    }));

export const resetPasswordSchema = z.object({

    token: z
        .string({
            required_error: "El token es obligatorio.",
            error: "El token es obligatorio."
        })
        .min(1),

    password: z
        .string({
            required_error: "La contraseña es obligatoria.",
            error: "La contraseña es obligatoria."
        })
        .min(
            6,
            "La contraseña debe tener mínimo 6 caracteres."
        )

});

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({
                required_error: "La contraseña actual es obligatoria.",
                invalid_type_error: "La contraseña actual debe ser una cadena de texto.",
                error: "La contraseña actual es obligatoria."
            })
            .optional()
            .default(""),

        newPassword: z
            .string({
                required_error: "La nueva contraseña es obligatoria.",
                invalid_type_error: "La nueva contraseña debe ser una cadena de texto.",
                error: "La nueva contraseña es obligatoria."
            })
            .optional()
            .default(""),

        confirmPassword: z
            .string({
                required_error: "La confirmación de la contraseña es obligatoria.",
                invalid_type_error: "La confirmación debe ser una cadena de texto.",
                error: "La confirmación de la contraseña es obligatoria."
            })
            .optional()
            .default("")
    })
    .passthrough()
    .superRefine((data, ctx) => {
        const currentPassword = data.currentPassword || "";
        if (!currentPassword || !currentPassword.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentPassword"],
                message: "La contraseña actual es obligatoria."
            });
        }

        const newPassword = data.newPassword || "";
        if (!newPassword || !newPassword.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["newPassword"],
                message: "La nueva contraseña es obligatoria."
            });
        } else if (newPassword.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["newPassword"],
                message: "La nueva contraseña debe tener mínimo 6 caracteres."
            });
        }

        const confirmPassword = data.confirmPassword || "";
        if (!confirmPassword || !confirmPassword.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "La confirmación de la contraseña es obligatoria."
            });
        } else if (newPassword && confirmPassword !== newPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Las contraseñas no coinciden."
            });
        }
    });
