import ClienteService from "./cliente.service.js";
import { successResponse } from "../../responses/success.response.js";

class ClienteController {

    // Crear cliente
    async crear(req, res, next) {
        try {

            const cliente = await ClienteService.crear(req.body);

            return successResponse(
                res,
                cliente,
                "Cliente creado correctamente.",
                201
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener todos
    async obtenerTodos(req, res, next) {
        try {

            const clientes = await ClienteService.obtenerTodos();

            return successResponse(
                res,
                clientes,
                "Clientes obtenidos correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Obtener por ID
    async obtenerPorId(req, res, next) {
        try {

            const { id } = req.params;

            const cliente = await ClienteService.obtenerPorId(id);

            return successResponse(
                res,
                cliente,
                "Cliente obtenido correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Actualizar
    async actualizar(req, res, next) {
        try {

            const { id } = req.params;

            const cliente = await ClienteService.actualizar(
                id,
                req.body
            );

            return successResponse(
                res,
                cliente,
                "Cliente actualizado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

    // Eliminar
    async eliminar(req, res, next) {
        try {

            const { id } = req.params;

            await ClienteService.eliminar(id);

            return successResponse(
                res,
                null,
                "Cliente eliminado correctamente."
            );

        } catch (error) {
            next(error);
        }
    }

}

export default new ClienteController();