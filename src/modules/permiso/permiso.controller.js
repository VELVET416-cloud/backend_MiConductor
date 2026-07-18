import permisoService from "./permiso.service.js";

class PermisoController {

    async crear(req, res) {
        try {

            const permiso = await permisoService.crear(req.body);

            return res.status(201).json({
                success: true,
                message: "Permiso creado correctamente.",
                data: permiso
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }
    }

    async obtenerTodos(req, res) {
        try {

            const permisos = await permisoService.obtenerTodos();

            return res.status(200).json({
                success: true,
                data: permisos
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

    async obtenerPorId(req, res) {
        try {

            const permiso = await permisoService.obtenerPorId(req.params.id);

            return res.status(200).json({
                success: true,
                data: permiso
            });

        } catch (error) {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }
    }

    async actualizar(req, res) {
        try {

            const permiso = await permisoService.actualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Permiso actualizado correctamente.",
                data: permiso
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }
    }

    async eliminar(req, res) {
        try {

            await permisoService.eliminar(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Permiso eliminado correctamente."
            });

        } catch (error) {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }
    }

}

export default new PermisoController();