import ClienteService from "./cliente.service.js";

import { successResponse } from "../../responses/success.response.js";

/**
 * Controlador encargado de gestionar las operaciones relacionadas
 * con los clientes.
 *
 * Se comunica con ClienteService para realizar las operaciones
 * de creación, consulta, actualización y eliminación.
 */
class ClienteController {

    /**
     * Crea un nuevo cliente.
     *
     * Los datos del cliente se reciben desde el cuerpo de la solicitud
     * y se envían al servicio correspondiente.
     */
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

    /**
     * Obtiene todos los clientes registrados.
     */
    async obtenerTodos(req, res, next) {

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const estado = req.query.estado || '';

            const clientesData = await ClienteService.obtenerTodos(page, limit, search, estado);

            return successResponse(
                res,
                clientesData,
                "Clientes obtenidos correctamente."
            );

        } catch (error) {

            next(error);

        }

    }

    /**
     * Obtiene una lista no paginada de todos los clientes activos.
     * Útil para selectores y combos.
     */
    async obtenerLista(req, res, next) {
        try {
            const clientes = await ClienteService.obtenerLista();
            return successResponse(
                res,
                clientes,
                "Lista de clientes obtenida correctamente."
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un cliente específico utilizando su ID.
     */
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

    /**
     * Actualiza la información de un cliente existente.
     *
     * El ID del cliente se obtiene de los parámetros de la solicitud
     * y los nuevos datos se reciben mediante req.body.
     */
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

    /**
     * Elimina un cliente utilizando su ID.
     */
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