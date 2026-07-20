import { ZodError } from "zod";
import { errorResponse } from "../responses/error.response.js";

const errorMiddleware = (error, req, res, next) => {

    console.error(error);

    // Errores de validación de Zod
    if (error instanceof ZodError) {

        return errorResponse(
            res,
            error.errors[0].message,
            400
        );

    }

    return errorResponse(
        res,
        error.message || "Error interno del servidor.",
        error.statusCode || 500
    );

};

export default errorMiddleware;