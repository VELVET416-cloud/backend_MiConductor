import multer from "multer";
import AppError from "../utils/AppError.js";

// Almacenamiento en memoria para no persistir archivos en el disco local
const storage = multer.memoryStorage();

// Tipos MIME y extensiones de imagen permitidas
const TIPOS_MIME_PERMITIDOS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const EXTENSIONES_PERMITIDAS = /\.(jpe?g|png|webp)$/i;

const fileFilter = (req, file, cb) => {
    const esMimeValido = TIPOS_MIME_PERMITIDOS.includes(file.mimetype);
    const esExtensionValida = EXTENSIONES_PERMITIDAS.test(file.originalname);

    if (!esMimeValido || !esExtensionValida) {
        return cb(
            new AppError(
                "Formato de archivo no permitido. Solo se aceptan imágenes en formato JPEG, JPG, PNG o WEBP.",
                400
            ),
            false
        );
    }

    cb(null, true);
};

const MAX_TAMANO_BYTES = 5 * 1024 * 1024; // 5 MB por imagen
const MAX_ARCHIVOS_POR_DEFECTO = 5;

/**
 * Middleware para procesar la subida de imágenes en solicitudes multipart/form-data.
 * Admite el campo estándar 'imagenes' y el campo singular 'imagen'.
 *
 * @param {string} fieldName - Nombre del campo principal (por defecto 'imagenes').
 * @param {number} maxArchivos - Máximo número de imágenes permitidas en la petición.
 */
export const uploadImagenesMiddleware = (fieldName = "imagenes", maxArchivos = MAX_ARCHIVOS_POR_DEFECTO) => {
    const upload = multer({
        storage,
        limits: {
            fileSize: MAX_TAMANO_BYTES,
            files: maxArchivos
        },
        fileFilter
    }).fields([
        { name: fieldName, maxCount: maxArchivos },
        { name: "imagenes", maxCount: maxArchivos },
        { name: "imagen", maxCount: maxArchivos }
    ]);

    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return next(
                            new AppError(
                                "El archivo supera el tamaño máximo permitido de 5 MB.",
                                400
                            )
                        );
                    }
                    if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
                        return next(
                            new AppError(
                                `Límite de imágenes excedido. Máximo ${maxArchivos} imágenes por petición.`,
                                400
                            )
                        );
                    }
                    return next(
                        new AppError(
                            `Error de procesamiento de archivo: ${err.message}`,
                            400
                        )
                    );
                }

                return next(err);
            }

            // Consolidar todos los archivos recibidos sin duplicar referencias
            const archivos = [];
            const archivosSet = new Set();

            if (req.files) {
                for (const key of Object.keys(req.files)) {
                    for (const archivo of req.files[key]) {
                        if (!archivosSet.has(archivo)) {
                            archivosSet.add(archivo);
                            archivos.push(archivo);
                        }
                    }
                }
            }

            if (archivos.length > maxArchivos) {
                return next(
                    new AppError(
                        `Límite de imágenes excedido. Máximo ${maxArchivos} imágenes por petición.`,
                        400
                    )
                );
            }

            req.archivosProcesados = archivos;
            next();
        });
    };
};

export default uploadImagenesMiddleware;

