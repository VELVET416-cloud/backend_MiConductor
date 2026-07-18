class AppError extends Error {

    constructor(message, statusCode = 500) {
        super(message);

        this.name = "AppError";
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }

}

export default AppError;