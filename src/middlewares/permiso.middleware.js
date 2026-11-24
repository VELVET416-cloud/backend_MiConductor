import AppError from "../utils/AppError.js";

const permisoMiddleware = (permisoRequerido) => {

    return (req, res, next) => {

        if (!req.user) {
            return next(
                new AppError(
                    "Usuario no autenticado.",
                    401
                )
            );
        }

        const permisos = req.user.permisos || [];

        if (!permisos.includes(permisoRequerido)) {
            return next(
                new AppError(
                    "No tiene permisos para realizar esta acción.",
                    403
                )
            );
        }

        next();

    };

};

export default permisoMiddleware;