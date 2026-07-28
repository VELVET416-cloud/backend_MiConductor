import mongoose from "mongoose";

import permisoRepository from "./permiso.repository.js";

import AppError from "../../utils/AppError.js";

class PermisoService {

    async crear(datos) {

        // Normalizar datos
        datos.nombre = datos.nombre.trim();
        datos.codigo = datos.codigo.trim().toLowerCase();
        datos.modulo = datos.modulo.trim();
        datos.descripcion = datos.descripcion.trim();

        // Validar código duplicado
        const existe = await permisoRepository.obtenerPorCodigo(
            datos.codigo
        );

        if (existe) {
            throw new AppError(
                "Ya existe un permiso con ese código.",
                409
            );
        }

        return await permisoRepository.crear(datos);

    }

    async obtenerTodos() {

        return await permisoRepository.obtenerTodos();

    }

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "ID de permiso inválido.",
                400
            );
        }

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new AppError(
                "Permiso no encontrado.",
                404
            );
        }

        return permiso;

    }

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "ID de permiso inválido.",
                400
            );
        }

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new AppError(
                "Permiso no encontrado.",
                404
            );
        }

        // Normalizar datos
        if (datos.nombre) {
            datos.nombre = datos.nombre.trim();
        }

        if (datos.codigo) {
            datos.codigo = datos.codigo.trim().toLowerCase();
        }

        if (datos.modulo) {
            datos.modulo = datos.modulo.trim();
        }

        if (datos.descripcion) {
            datos.descripcion = datos.descripcion.trim();
        }

        // Validar código repetido
        if (
            datos.codigo &&
            datos.codigo !== permiso.codigo
        ) {

            const existe = await permisoRepository.obtenerPorCodigo(
                datos.codigo
            );

            if (existe) {
                throw new AppError(
                    "Ya existe un permiso con ese código.",
                    409
                );
            }

        }

        return await permisoRepository.actualizar(
            id,
            datos
        );

    }

    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "ID de permiso inválido.",
                400
            );
        }

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new AppError(
                "Permiso no encontrado.",
                404
            );
        }

        return await permisoRepository.eliminar(id);

    }

}

export default new PermisoService();