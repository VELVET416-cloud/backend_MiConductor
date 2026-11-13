import { ZodError } from "zod";
import { errorResponse } from "../responses/error.response.js";

const errorMiddleware = (error, req, res, next) => {
    console.error(error);

    if (error instanceof ZodError) {
        const issues = error.issues.map(issue => ({
            campo: issue.path.join("."),
            mensaje: issue.message
        }));
        const firstMessage = issues[0]?.mensaje || "Error de validación.";

        return res.status(400).json({
            success: false,
            message: firstMessage,
            errors: issues
        });
    }

    if (error.code === 11000) {
        const campos = error.keyPattern ? Object.keys(error.keyPattern) : [];
        let mensaje = "Ya existe un registro con estos datos.";
        if (campos.includes("correo") || (error.message && error.message.includes("correo"))) {
            mensaje = "Ya existe un usuario con ese correo.";
        } else if (
            campos.includes("documento") ||
            campos.includes("tipoDocumento") ||
            (error.message && error.message.includes("documento"))
        ) {
            mensaje = "Ya existe un usuario con ese documento.";
        }
        return errorResponse(res, mensaje, 409);
    }

    return errorResponse(
        res,
        error.message || "Error interno del servidor.",
        error.statusCode || 500
    );
};

export default errorMiddleware;
