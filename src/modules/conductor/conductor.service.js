import mongoose from "mongoose";

import ConductorRepository from "./conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";

import AppError from "../../utils/AppError.js";

class ConductorService {

    async crear(datos) {

        const licencia =
            datos.licencia?.trim();

        if (!licencia) {

            throw new AppError(
                "La licencia es obligatoria.",
                400
            );

        }

        const licenciaExiste =
            await ConductorRepository.obtenerPorLicencia(
                licencia
            );

        if (licenciaExiste) {

            throw new AppError(
                "La licencia ya se encuentra registrada.",
                409
            );

        }

        let usuarioCreado = null;

        try {

            usuarioCreado =
                await UsuarioHelper.crear(
                    {
                        nombre: datos.nombre,
                        apellido: datos.apellido,
                        tipoDocumento: datos.tipoDocumento,
                        documento: datos.documento,
                        correo: datos.correo,
                        password: datos.password,
                        telefono: datos.telefono
                    },
                    "CONDUCTOR"
                );


            const conductor =
                await ConductorRepository.crear({

                    usuario: usuarioCreado._id,

                    licencia,

                    categoriaLicencia:
                        datos.categoriaLicencia
                            ?.trim()
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
            // SI FALLA LA CREACIÓN DEL CONDUCTOR,
            // ELIMINAR LÓGICAMENTE EL USUARIO
            

            if (usuarioCreado?._id) {

                await UsuarioRepository.eliminar(
                    usuarioCreado._id
                );

            }

            throw error;
        }
    }

    async obtenerTodos() {

        return await ConductorRepository.obtenerTodos();

    }

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

        const datosUsuario = {};

        if (datos.nombre !== undefined)
            datosUsuario.nombre = datos.nombre;

        if (datos.apellido !== undefined)
            datosUsuario.apellido = datos.apellido;

        if (datos.tipoDocumento !== undefined)
            datosUsuario.tipoDocumento =
                datos.tipoDocumento;

        if (datos.documento !== undefined)
            datosUsuario.documento =
                datos.documento;

        if (datos.correo !== undefined)
            datosUsuario.correo =
                datos.correo;

        if (datos.telefono !== undefined)
            datosUsuario.telefono =
                datos.telefono;

        if (datos.password !== undefined)
            datosUsuario.password =
                datos.password;

        if (Object.keys(datosUsuario).length > 0) {

            await UsuarioHelper.actualizar(
                conductor.usuario._id,
                datosUsuario
            );

        }

        const datosConductor = {};

        if (datos.licencia !== undefined) {

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

        if (datos.categoriaLicencia !== undefined) {

            datosConductor.categoriaLicencia =
                datos.categoriaLicencia
                    .trim()
                    .toUpperCase();
        }

        if (datos.fechaExpedicion !== undefined)
            datosConductor.fechaExpedicion =
                datos.fechaExpedicion;

        if (datos.fechaVencimiento !== undefined)
            datosConductor.fechaVencimiento =
                datos.fechaVencimiento;

        if (datos.experiencia !== undefined)
            datosConductor.experiencia =
                datos.experiencia;

        if (datos.disponible !== undefined)
            datosConductor.disponible =
                datos.disponible;


        const conductorActualizado =
            await ConductorRepository.actualizar(
                id,
                datosConductor
            );

        return conductorActualizado;
    }

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

        await ConductorRepository.eliminar(id);

        await UsuarioHelper.eliminar(
            conductor.usuario._id
        );

    }


    async cambiarDisponibilidad(id, disponible) {

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


    async obtenerDisponibles() {

        return await ConductorRepository.obtenerDisponibles();

    }


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
                licencia:
                    datos.licencia.trim(),

                categoriaLicencia:
                    datos.categoriaLicencia
                        .trim()
                        .toUpperCase(),

                fechaExpedicion:
                    datos.fechaExpedicion,

                fechaVencimiento:
                    datos.fechaVencimiento
            }
        );
    }
}

export default new ConductorService();