import vehiculoService from "./vehiculo.service.js";

class VehiculoController {

    async crear(req, res, next) {
        try {
            const vehiculo = await vehiculoService.crear(req.body);
            return res.status(201).json({
                success: true,
                message: "Vehículo creado correctamente.",
                data: vehiculo
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {
            const vehiculos = await vehiculoService.obtenerTodos();
            return res.status(200).json({
                success: true,
                data: vehiculos
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {
            const vehiculo = await vehiculoService.obtenerPorId(req.params.id);
            return res.status(200).json({
                success: true,
                data: vehiculo
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorPlaca(req, res, next) {
        try {
            const vehiculo = await vehiculoService.obtenerPorPlaca(req.params.placa);
            return res.status(200).json({
                success: true,
                data: vehiculo
            });
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorConductor(req, res, next) {
        try {
            const vehiculos = await vehiculoService.obtenerPorConductor(req.params.id);
            return res.status(200).json({
                success: true,
                data: vehiculos
            });
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const vehiculo = await vehiculoService.actualizar(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: "Vehículo actualizado correctamente.",
                data: vehiculo
            });
        } catch (error) {
            next(error);
        }
    }

    async actualizarEstado(req, res, next) {
        try {
            const vehiculo = await vehiculoService.actualizarEstado(req.params.id, req.body.estado);
            return res.status(200).json({
                success: true,
                message: "Estado del vehículo actualizado correctamente.",
                data: vehiculo
            });
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await vehiculoService.eliminar(req.params.id);
            return res.status(200).json({
                success: true,
                message: "Vehículo eliminado correctamente."
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new VehiculoController();
