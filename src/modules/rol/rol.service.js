import mongoose from "mongoose";
import rolRepository from "./rol.repository.js";
import Permiso from "../permiso/permiso.model.js";
import AppError from "../../utils/AppError.js";

class RolService {

    async crear(datos) {

        datos.nombre = datos.nombre.trim().toUpperCase();

        const existe = await rolRepository.obtenerPorNombre(datos.nombre);

        if (existe) {
            throw new AppError("Ya existe un rol con ese nombre.", 409);
        }

        if (datos.permisos && datos.permisos.length > 0) {

            const permisos = await Permiso.find({
                codigo: { $in: datos.permisos }
            });

            if (permisos.length !== datos.permisos.length) {
                throw new AppError("Uno o varios permisos no existen.", 400);
            }

            datos.permisos = permisos.map((permiso) => permiso._id);
        }

        return await rolRepository.crear(datos);
    }

    async obtenerTodos() {
        return await rolRepository.obtenerTodos();
    }

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de rol inválido.", 400);
        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {
            throw new AppError("Rol no encontrado.", 404);
        }

        return rol;
    }

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de rol inválido.", 400);
        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {
            throw new AppError("Rol no encontrado.", 404);
        }

        if (rol.esSistema && datos.nombre) {

            const nuevoNombre = datos.nombre.trim().toUpperCase();

            if (nuevoNombre !== rol.nombre) {
                throw new AppError(
                    "No se puede cambiar el nombre de un rol del sistema.",
                    403
                );
            }

        }

        if (datos.nombre) {

            datos.nombre = datos.nombre.trim().toUpperCase();

            if (datos.nombre !== rol.nombre) {

                const existe = await rolRepository.obtenerPorNombre(datos.nombre);

                if (existe) {
                    throw new AppError("Ya existe un rol con ese nombre.", 409);
                }

            }

        }

        if (datos.permisos && datos.permisos.length > 0) {

            const permisos = await Permiso.find({
                codigo: { $in: datos.permisos }
            });

            if (permisos.length !== datos.permisos.length) {
                throw new AppError("Uno o varios permisos no existen.", 400);
            }

            datos.permisos = permisos.map((permiso) => permiso._id);
        }

        return await rolRepository.actualizar(id, datos);
    }

    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("ID de rol inválido.", 400);
        }

        const rol = await rolRepository.obtenerPorId(id);

        if (!rol) {
            throw new AppError("Rol no encontrado.", 404);
        }

        if (rol.esSistema) {
            throw new AppError(
                `El rol "${rol.nombre}" pertenece al sistema y no puede eliminarse.`,
                403
            );
        }

        return await rolRepository.eliminar(id);
    }

}

export default new RolService();