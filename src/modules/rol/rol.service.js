import mongoose from "mongoose";
import usuarioRepository from "../usuario/usuario.repository.js";
import rolRepository from "./rol.repository.js";
import Permiso from "../permiso/permiso.model.js";
import AppError from "../../utils/AppError.js";

class RolService {

    async crear(datos) {

        // Normalizar datos
        datos.nombre = datos.nombre.trim().toUpperCase();
        datos.descripcion = datos.descripcion.trim();

        // Validar nombre repetido
        const existe = await rolRepository.obtenerPorNombre(
            datos.nombre
        );

        if (existe) {
            throw new AppError(
                "Ya existe un rol con ese nombre.",
                409
            );
        }

        // Validar permisos
        if (Array.isArray(datos.permisos)) {

            const permisos = await Permiso.find({
                _id: {
                    $in: datos.permisos
                },
                activo: true
            });

            if (permisos.length !== datos.permisos.length) {
                throw new AppError(
                    "Uno o más permisos no existen.",
                    400
                );
            }

            datos.permisos = permisos.map(
                permiso => permiso._id
            );

        }

        return await rolRepository.crear(datos);

    }

    async obtenerTodos() {

        return await rolRepository.obtenerTodos();

    }

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "ID de rol inválido.",
                400
            );
        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {
            throw new AppError(
                "Rol no encontrado.",
                404
            );
        }

        return rol;

    }

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "ID de rol inválido.",
                400
            );
        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {
            throw new AppError(
                "Rol no encontrado.",
                404
            );
        }
        // No permitir desactivar un rol que tenga usuarios activos
        if (datos.activo === false && rol.activo === true) {

            const cantidadUsuarios =
                await usuarioRepository.contarPorRol(id);

            if (cantidadUsuarios > 0) {

                throw new AppError(
                    `No se puede desactivar el rol porque tiene ${cantidadUsuarios} usuario(s) asignado(s). Reasigne los usuarios a otro rol antes de continuar.`,
                    409
                );

            }
        }

        // No permitir modificar un rol del sistema
        if (rol.esSistema) {

            // No permitir cambiar el nombre
            if (datos.nombre) {

                const nuevoNombre =
                    datos.nombre.trim().toUpperCase();

                if (nuevoNombre !== rol.nombre) {

                    throw new AppError(
                        "No se puede cambiar el nombre de un rol del sistema.",
                        403
                    );

                }

            }

            // No permitir desactivar el rol
            if (
                datos.activo !== undefined &&
                datos.activo === false
            ) {

                throw new AppError(
                    "El rol del sistema no puede desactivarse.",
                    403
                );

            }

        }
        // Normalizar nombre
        if (datos.nombre) {

            datos.nombre = datos.nombre
                .trim()
                .toUpperCase();

            if (datos.nombre !== rol.nombre) {

                const existe =
                    await rolRepository.obtenerPorNombre(
                        datos.nombre
                    );

                if (existe) {

                    throw new AppError(
                        "Ya existe un rol con ese nombre.",
                        409
                    );

                }

            }

        }

        // Normalizar descripción
        if (datos.descripcion) {
            datos.descripcion =
                datos.descripcion.trim();
        }

        // Validar permisos
        if (Array.isArray(datos.permisos)) {

            const permisos = await Permiso.find({
                _id: {
                    $in: datos.permisos
                },
                activo: true
            });

            if (permisos.length !== datos.permisos.length) {

                throw new AppError(
                    "Uno o más permisos no existen.",
                    400
                );

            }

            datos.permisos = permisos.map(
                permiso => permiso._id
            );

        }

        return await rolRepository.actualizar(
            id,
            datos
        );

    }

    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "ID de rol inválido.",
                400
            );

        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {

            throw new AppError(
                "Rol no encontrado.",
                404
            );

        }

        if (datos.activo === false && rol.esSistema) {

            throw new AppError(
                `El rol "${rol.nombre}" pertenece al sistema y no puede desactivarse.`,
                403
            );

        }

        await rolRepository.eliminar(id);

    }

}

export default new RolService();