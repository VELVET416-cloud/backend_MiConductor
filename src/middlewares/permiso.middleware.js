import AppError from "../utils/AppError.js";
import { isAdminOrSuperAdminRoleName } from "../constants/permiso.js";

const permisoMiddleware = (...permisosRequeridos) => {

    const listaRequeridos = permisosRequeridos
        .flat()
        .filter(Boolean);

    return (req, res, next) => {

        if (!req.user) {
            return next(
                new AppError(
                    "Usuario no autenticado.",
                    401
                )
            );
        }

        // El SUPERADMINISTRADOR y el ADMINISTRADOR siempre tienen acceso irrestricto a módulos administrativos
        if (isAdminOrSuperAdminRoleName(req.user.rol)) {
            return next();
        }

        const permisos = Array.isArray(req.user.permisos) ? req.user.permisos : [];

        const tienePermiso = listaRequeridos.some(permiso =>
            permisos.includes(permiso)
        );

        if (!tienePermiso) {
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