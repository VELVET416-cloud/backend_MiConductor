export const errorResponse = (
    res,
    message = "Ha ocurrido un error.",
    statusCode = 500,
    errors = null
) => {

    return res.status(statusCode).json({

        success: false,

        message,

        errors

    });

};