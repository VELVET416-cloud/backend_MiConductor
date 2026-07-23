import VehiculoService from "./vehiculo.service.js";
import { successResponse } from "../../responses/success.response.js";

class VehiculoController {

    // Crear vehículo
    async crear(req, res, next) {
        try {

            const vehiculo = await VehiculoService.crear(req.body);

            return successResponse(
                res,
                vehiculo,
                "Vehículo registrado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener todos
    async obtenerTodos(req, res, next) {
        try {

            const vehiculos = await VehiculoService.obtenerTodos();

            return successResponse(
                res,
                vehiculos,
                "Vehículos obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener por ID
    async obtenerPorId(req, res, next) {
        try {

            const { id } = req.params;

            const vehiculo = await VehiculoService.obtenerPorId(id);

            return successResponse(
                res,
                vehiculo,
                "Vehículo obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener vehículos por cliente
    async obtenerPorCliente(req, res, next) {
        try {

            const { clienteId } = req.params;

            const vehiculos = await VehiculoService.obtenerPorCliente(
                clienteId
            );

            return successResponse(
                res,
                vehiculos,
                "Vehículos del cliente obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Actualizar
    async actualizar(req, res, next) {
        try {

            const { id } = req.params;

            const vehiculo = await VehiculoService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                vehiculo,
                "Vehículo actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Eliminar
    async eliminar(req, res, next) {
        try {

            const { id } = req.params;

            await VehiculoService.eliminar(id);

            return successResponse(
                res,
                null,
                "Vehículo eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new VehiculoController();