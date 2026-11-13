import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
    .string()
    .regex(
        objectIdRegex,
        "El identificador tiene un formato inválido."
    );

export const notificacionIdParamsSchema = z.object({
    id: objectIdSchema
});

export const registrarDispositivoSchema = z.object({
    token: z
        .string({
            required_error: "El token FCM del dispositivo es obligatorio."
        })
        .trim()
        .min(10, "El token FCM debe tener al menos 10 caracteres."),

    plataforma: z
        .string()
        .trim()
        .toUpperCase()
        .pipe(
            z.enum(["FLUTTER", "ANDROID", "IOS", "WEB", "FLUTTER_ANDROID", "FLUTTER_IOS", "DESCONOCIDO"], {
                errorMap: () => ({
                    message: "La plataforma debe ser FLUTTER, ANDROID, IOS, WEB, FLUTTER_ANDROID, FLUTTER_IOS o DESCONOCIDO."
                })
            })
        )
        .optional()
        .default("DESCONOCIDO")
});

export const desvincularDispositivoSchema = z.object({
    token: z
        .string({
            required_error: "El token FCM es obligatorio para desvincular el dispositivo."
        })
        .trim()
        .min(1, "El token no puede estar vacío.")
});

export const listarNotificacionesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    leida: z
        .string()
        .optional()
        .transform((val) => {
            if (val === "true" || val === "1") return true;
            if (val === "false" || val === "0") return false;
            return undefined;
        })
});

