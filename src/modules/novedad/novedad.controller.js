import novedadService from "./novedad.service.js";

class NovedadController {

    async crear(req, res, next) {
        try {
            const novedad = await novedadService.crear(req.body);
            return res.status(201).json({
                success: true,
                message: "Novedad creada correctamente.",
                data: novedad
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {
            const novedades = await novedadService.obtenerTodos();
            return res.status(200).json({
                success: true,
                data: novedades
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {
            const novedad = await novedadService.obtenerPorId(req.params.id);
            return res.status(200).json({
                success: true,
                data: novedad
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorServicio(req, res, next) {
        try {
            const novedades = await novedadService.obtenerPorServicio(req.params.id);
            return res.status(200).json({
                success: true,
                data: novedades
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorConductor(req, res, next) {
        try {
            const novedades = await novedadService.obtenerPorConductor(req.params.id);
            return res.status(200).json({
                success: true,
                data: novedades
            });
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const novedad = await novedadService.actualizar(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: "Novedad actualizada correctamente.",
                data: novedad
            });
        } catch (error) {
            next(error);
        }
    }

    async actualizarEstado(req, res, next) {
        try {
            const novedad = await novedadService.actualizarEstado(req.params.id, req.body.estado);
            return res.status(200).json({
                success: true,
                message: "Estado de la novedad actualizado correctamente.",
                data: novedad
            });
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await novedadService.eliminar(req.params.id);
            return res.status(200).json({
                success: true,
                message: "Novedad eliminada correctamente."
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new NovedadController();
