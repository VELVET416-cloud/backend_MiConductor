import permisoRepository from "./permiso.repository.js";

class PermisoService {

    async crear(datos) {

        const existe = await permisoRepository.obtenerPorCodigo(datos.codigo);

        if (existe) {
            throw new Error("Ya existe un permiso con ese código.");
        }

        return await permisoRepository.crear(datos);
    }

    async obtenerTodos() {
        return await permisoRepository.obtenerTodos();
    }

    async obtenerPorId(id) {

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new Error("Permiso no encontrado.");
        }

        return permiso;
    }

    async actualizar(id, datos) {

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new Error("Permiso no encontrado.");
        }

        if (datos.codigo && datos.codigo !== permiso.codigo) {

            const existe = await permisoRepository.obtenerPorCodigo(datos.codigo);

            if (existe) {
                throw new Error("Ya existe un permiso con ese código.");
            }

        }

        return await permisoRepository.actualizar(id, datos);
    }

    async eliminar(id) {

        const permiso = await permisoRepository.obtenerPorId(id);

        if (!permiso) {
            throw new Error("Permiso no encontrado.");
        }

        return await permisoRepository.eliminar(id);
    }

}

export default new PermisoService();