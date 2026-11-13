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

        // El ADMINISTRADOR siempre tiene acceso irrestricto
        if (req.user.rol === "ADMINISTRADOR") {
            return next();
        }

        // Modificar o crear roles y permisos es exclusivo del rol ADMINISTRADOR
        const permisosSoloAdmin = ["crear.roles", "editar.roles", "eliminar.roles", "crear.permisos", "editar.permisos", "eliminar.permisos"];
        if (permisosSoloAdmin.includes(permisoRequerido)) {
            return next(
                new AppError(
                    "Solo los administradores tienen permiso para crear, editar o eliminar roles y permisos.",
                    403
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