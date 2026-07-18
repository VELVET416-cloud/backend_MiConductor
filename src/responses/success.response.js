export const successResponse = (
    res,
    data = null,
    message = "Operación realizada correctamente.",
    statusCode = 200
) => {

    return res.status(statusCode).json({

        success: true,

        message,

        data

    });

};