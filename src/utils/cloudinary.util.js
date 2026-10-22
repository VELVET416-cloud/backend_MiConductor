import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";
import AppError from "./AppError.js";

/**
 * Valida que las variables de entorno requeridas para Cloudinary estén configuradas.
 */
const verificarCredencialesCloudinary = () => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        throw new AppError(
            "Las credenciales de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) no están configuradas en el archivo .env.",
            500
        );
    }
};

/**
 * Sube un buffer de archivo a Cloudinary utilizando un stream en memoria.
 * @param {Buffer} buffer - Buffer del archivo en memoria (Multer memoryStorage).
 * @param {string} folder - Carpeta destino en Cloudinary.
 * @returns {Promise<{ url: string, public_id: string, formato: string }>}
 */
export const subirACloudinary = (buffer, folder = "mi_conductor/solicitudes") => {
    verificarCredencialesCloudinary();

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(
                        new AppError(
                            `Error de Cloudinary al subir imagen: ${error.message || "Fallo en la carga remota."}`,
                            502
                        )
                    );
                }

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    formato: result.format
                });
            }
        );

        stream.end(buffer);
    });
};

/**
 * Elimina un recurso de Cloudinary mediante su public_id verificado.
 * @param {string} publicId - Identificador único del recurso en Cloudinary.
 * @returns {Promise<{ result: string }>}
 */
export const eliminarDeCloudinary = async (publicId) => {
    verificarCredencialesCloudinary();

    try {
        const resultado = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        });

        if (resultado.result !== "ok" && resultado.result !== "not found") {
            throw new AppError(
                `Cloudinary no pudo eliminar el recurso: ${resultado.result}`,
                502
            );
        }

        return resultado;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            `Error de Cloudinary al eliminar imagen: ${error.message || "Fallo en la eliminación remota."}`,
            502
        );
    }
};

