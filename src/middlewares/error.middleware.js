import { ZodError } from "zod";
import { errorResponse } from "../responses/error.response.js";

const errorMiddleware = (error, req, res, next) => {

    console.error(error);

    if (error instanceof ZodError) {

        return res.status(400).json({
            success: false,
            message: "Error de validación.",
            errors: error.issues.map(issue => ({
                campo: issue.path.join("."),
                mensaje: issue.message
            }))
        });

    }

    return errorResponse(
        res,
        error.message || "Error interno del servidor.",
        error.statusCode || 500
    );

};

export default errorMiddleware;