import ConductorService from "./conductor.service.js";
import { successResponse } from "../../responses/success.response.js";

class ConductorController {
    // Crear conductor
    async crear(req, res, next) {
        try {
            const conductor = await ConductorService.crear(req.body);

            return successResponse(
                res,
                conductor,
                "Conductor registrado exitosamente. Se ha despachado un correo de activación.",
                201
            );
        } catch (error) {
            next(error);
        }
    }

    // Obtener todos
    async obtenerTodos(req, res, next) {
        try {
            const conductores = await ConductorService.obtenerTodos();

            return successResponse(
                res,
                conductores,
                "Conductores obtenidos correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // Obtener por ID
    async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;
            const conductor = await ConductorService.obtenerPorId(id);

            return successResponse(
                res,
                conductor,
                "Conductor obtenido correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // Actualizar
    async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const conductor = await ConductorService.actualizar(id, req.body);

            return successResponse(
                res,
                conductor,
                "Conductor actualizado correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // Eliminar con validación de relaciones
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await ConductorService.eliminar(id);

            return successResponse(
                res,
                null,
                "Conductor eliminado definitivamente del sistema."
            );
        } catch (error) {
            next(error);
        }
    }

    // Cambiar disponibilidad operativa (Disponible / Fuera de servicio)
    async cambiarDisponibilidad(req, res, next) {
        try {
            const { id } = req.params;
            const { disponible } = req.body;

            const conductor = await ConductorService.cambiarDisponibilidad(
                id,
                disponible
            );

            return successResponse(
                res,
                conductor,
                disponible
                    ? "Disponibilidad activada. El conductor ahora puede recibir asignaciones."
                    : "Conductor puesto fuera de servicio."
            );
        } catch (error) {
            next(error);
        }
    }

    // Control administrativo de estados (ACTIVO, INACTIVO, RETIRADO, FALLECIDO)
    async cambiarEstadoAdministrativo(req, res, next) {
        try {
            const { id } = req.params;
            const { estadoConductor, motivo } = req.body;
            const usuarioId = req.user?.id || req.user?._id || null;

            const conductor = await ConductorService.cambiarEstadoAdministrativo(id, {
                estadoConductor,
                motivo,
                usuarioId
            });

            return successResponse(
                res,
                conductor,
                `Estado administrativo del conductor actualizado correctamente a '${estadoConductor}'.`
            );
        } catch (error) {
            next(error);
        }
    }

    // Obtener conductores disponibles
    async obtenerDisponibles(req, res, next) {
        try {
            const conductores = await ConductorService.obtenerDisponibles();

            return successResponse(
                res,
                conductores,
                "Conductores disponibles obtenidos correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // Obtener conductor por usuario
    async obtenerPorUsuario(req, res, next) {
        try {
            const { usuarioId } = req.params;
            const conductor = await ConductorService.obtenerPorUsuario(usuarioId);

            return successResponse(
                res,
                conductor,
                "Conductor obtenido correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    // Actualizar licencia
    async actualizarLicencia(req, res, next) {
        try {
            const { id } = req.params;
            const conductor = await ConductorService.actualizarLicencia(id, req.body);

            return successResponse(
                res,
                conductor,
                "Licencia de conducción actualizada correctamente."
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new ConductorController();
