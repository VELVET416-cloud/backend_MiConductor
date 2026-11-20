import mongoose from "mongoose";

import permisoRepository from "./permiso.repository.js";
import Rol from "../rol/rol.model.js";
import { seedPermisos } from "../../seeders/permiso.seeder.js";
import { seedRoles } from "../../seeders/rol.seeder.js";

import AppError from "../../utils/AppError.js";

let permisosVerificadosEnRuntime = false;

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

        let permisos = await permisoRepository.obtenerTodos();

        if (!permisosVerificadosEnRuntime) {
            permisosVerificadosEnRuntime = true;
            const codigosExistentes = new Set(permisos.map(p => p.codigo));
            const codigosEsperados = [
                "crear.roles", "ver.roles", "editar.roles", "eliminar.roles",
                "crear.permisos", "ver.permisos", "editar.permisos", "eliminar.permisos",
                "crear.usuarios", "ver.usuarios", "editar.usuarios", "eliminar.usuarios",
                "crear.vehiculos", "ver.vehiculos", "editar.vehiculos", "eliminar.vehiculos",
                "crear.conductores", "ver.conductores", "editar.conductores", "eliminar.conductores",
                "crear.clientes", "ver.clientes", "editar.clientes", "eliminar.clientes",
                "crear.solicitudes", "asignar.solicitudes", "ruta.solicitudes", "ver.solicitudes", "cancelar.solicitudes",
                "crear.novedades", "ver.novedades", "editar.novedades", "eliminar.novedades"
            ];

            const faltanPermisos = codigosEsperados.some(c => !codigosExistentes.has(c));
            if (faltanPermisos) {
                await seedPermisos();
                await seedRoles();
                permisos = await permisoRepository.obtenerTodos();
            }
        }

        return permisos;

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

        await Rol.updateMany(
            { permisos: id },
            { $pull: { permisos: id } }
        );

        return await permisoRepository.eliminar(id);

    }

}

export default new PermisoService();