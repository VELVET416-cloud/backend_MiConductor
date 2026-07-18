import { errorResponse } from "../responses/error.response.js";

export const errorMiddleware = (error, req, res, next) => {

    console.error(error);

    return errorResponse(

        res,

        error.message || "Error interno del servidor.",

        error.statusCode || 500

    );

};

export default errorMiddleware;