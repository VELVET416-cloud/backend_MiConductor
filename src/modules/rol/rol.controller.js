import rolService from "./rol.service.js";

class RolController {

    async crear(req, res, next) {
        try {

            const rol = await rolService.crear(req.body);

            return res.status(201).json({
                success: true,
                message: "Rol creado correctamente.",
                data: rol
            });

        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {

            const roles = await rolService.obtenerTodos();

            return res.status(200).json({
                success: true,
                data: roles
            });

        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {

            const rol = await rolService.obtenerPorId(req.params.id);

            return res.status(200).json({
                success: true,
                data: rol
            });

        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {

            const rol = await rolService.actualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Rol actualizado correctamente.",
                data: rol
            });

        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {

            await rolService.eliminar(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Rol eliminado correctamente."
            });

        } catch (error) {
            next(error);
        }
    }

}

export default new RolController();