import mongoose from "mongoose";

import ConductorRepository from "./conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import RolRepository from "../rol/rol.repository.js";

import AppError from "../../utils/AppError.js";

class ConductorService {

    // ======================================================
    // CREAR CONDUCTOR
    // ======================================================

    async crear(datos) {

        // Buscar el rol CONDUCTOR

        const rolConductor =
            await RolRepository.obtenerPorNombre(
                "CONDUCTOR"
            );

        if (!rolConductor) {

            throw new AppError(
                "No existe el rol CONDUCTOR.",
                404
            );

        }

        // Crear usuario

        const usuario =
            await UsuarioHelper.crear({

                nombre: datos.nombre,

                apellido: datos.apellido,

                tipoDocumento: datos.tipoDocumento,

                documento: datos.documento,

                correo: datos.correo,

                password: datos.password,

                telefono: datos.telefono,

                rol: rolConductor._id

            });

        try {

            // Validar licencia

            const licenciaExiste =
                await ConductorRepository.obtenerPorLicencia(
                    datos.licencia.trim()
                );

            if (licenciaExiste) {

                throw new AppError(
                    "La licencia ya se encuentra registrada.",
                    409
                );

            }

            // Crear conductor

            const conductor =
                await ConductorRepository.crear({

                    usuario: usuario._id,

                    licencia: datos.licencia.trim(),

                    categoriaLicencia:
                        datos.categoriaLicencia
                            .trim()
                            .toUpperCase(),

                    fechaExpedicion:
                        datos.fechaExpedicion,

                    fechaVencimiento:
                        datos.fechaVencimiento,

                    experiencia:
                        datos.experiencia ?? 0,

                    disponible:
                        datos.disponible ?? false

                });

            return await ConductorRepository.obtenerPorId(
                conductor._id
            );

        } catch (error) {

            // Si falla la creación del conductor,
            // eliminar el usuario creado.

            await UsuarioRepository.eliminar(
                usuario._id
            );

            throw error;

        }

    }

        // ======================================================
    // OBTENER TODOS
    // ======================================================

    async obtenerTodos() {

        return await ConductorRepository.obtenerTodos();

    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================

    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorId(id);

        if (!conductor) {

            throw new AppError(
                "Conductor no encontrado.",
                404
            );

        }

        return conductor;

    }

    // ======================================================
    // ACTUALIZAR
    // ======================================================

    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorId(id);

        if (!conductor) {

            throw new AppError(
                "Conductor no encontrado.",
                404
            );

        }

        // ==========================
        // ACTUALIZAR USUARIO
        // ==========================

        const datosUsuario = {};

        if (datos.nombre)
            datosUsuario.nombre = datos.nombre;

        if (datos.apellido)
            datosUsuario.apellido = datos.apellido;

        if (datos.tipoDocumento)
            datosUsuario.tipoDocumento =
                datos.tipoDocumento;

        if (datos.documento)
            datosUsuario.documento =
                datos.documento;

        if (datos.correo)
            datosUsuario.correo =
                datos.correo;

        if (datos.telefono)
            datosUsuario.telefono =
                datos.telefono;

        if (datos.password)
            datosUsuario.password =
                datos.password;

        if (
            Object.keys(datosUsuario).length > 0
        ) {

            await UsuarioHelper.actualizar(
                conductor.usuario._id,
                datosUsuario
            );

        }

        // ==========================
        // ACTUALIZAR CONDUCTOR
        // ==========================

        const datosConductor = {};

        if (datos.licencia) {

            const licenciaExiste =
                await ConductorRepository.obtenerPorLicencia(
                    datos.licencia.trim()
                );

            if (
                licenciaExiste &&
                licenciaExiste._id.toString() !== id
            ) {

                throw new AppError(
                    "La licencia ya se encuentra registrada.",
                    409
                );

            }

            datosConductor.licencia =
                datos.licencia.trim();

        }

        if (datos.categoriaLicencia) {

            datosConductor.categoriaLicencia =
                datos.categoriaLicencia
                    .trim()
                    .toUpperCase();

        }

        if (datos.fechaExpedicion)
            datosConductor.fechaExpedicion =
                datos.fechaExpedicion;

        if (datos.fechaVencimiento)
            datosConductor.fechaVencimiento =
                datos.fechaVencimiento;

        if (
            datos.experiencia !== undefined
        ) {

            datosConductor.experiencia =
                datos.experiencia;

        }

        if (
            datos.disponible !== undefined
        ) {

            datosConductor.disponible =
                datos.disponible;

        }

        return await ConductorRepository.actualizar(
            id,
            datosConductor
        );

    }


        // ======================================================
    // ELIMINAR
    // ======================================================

    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorId(id);

        if (!conductor) {

            throw new AppError(
                "Conductor no encontrado.",
                404
            );

        }

        // Eliminar conductor (lógico)

        await ConductorRepository.eliminar(id);

        // Eliminar usuario (lógico)

        await UsuarioHelper.eliminar(
            conductor.usuario._id
        );

        return;

    }

    // ======================================================
    // CAMBIAR DISPONIBILIDAD
    // ======================================================

    async cambiarDisponibilidad(
        id,
        disponible
    ) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorId(id);

        if (!conductor) {

            throw new AppError(
                "Conductor no encontrado.",
                404
            );

        }

        return await ConductorRepository.cambiarDisponibilidad(
            id,
            disponible
        );

    }

    // ======================================================
    // OBTENER DISPONIBLES
    // ======================================================

    async obtenerDisponibles() {

        return await ConductorRepository.obtenerDisponibles();

    }

    // ======================================================
    // OBTENER POR USUARIO
    // ======================================================

    async obtenerPorUsuario(usuarioId) {

        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {

            throw new AppError(
                "El id del usuario no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorUsuario(
                usuarioId
            );

        if (!conductor) {

            throw new AppError(
                "No existe un conductor asociado a este usuario.",
                404
            );

        }

        return conductor;

    }

    // ======================================================
    // ACTUALIZAR LICENCIA
    // ======================================================

    async actualizarLicencia(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {

            throw new AppError(
                "El id del conductor no es válido.",
                400
            );

        }

        const conductor =
            await ConductorRepository.obtenerPorId(id);

        if (!conductor) {

            throw new AppError(
                "Conductor no encontrado.",
                404
            );

        }

        const licenciaExiste =
            await ConductorRepository.obtenerPorLicencia(
                datos.licencia.trim()
            );

        if (
            licenciaExiste &&
            licenciaExiste._id.toString() !== id
        ) {

            throw new AppError(
                "La licencia ya se encuentra registrada.",
                409
            );

        }

        return await ConductorRepository.actualizarLicencia(
            id,
            {
                licencia: datos.licencia.trim(),
                categoriaLicencia: datos.categoriaLicencia
                    .trim()
                    .toUpperCase(),
                fechaExpedicion: datos.fechaExpedicion,
                fechaVencimiento: datos.fechaVencimiento
            }
        );

    }

}

export default new ConductorService();