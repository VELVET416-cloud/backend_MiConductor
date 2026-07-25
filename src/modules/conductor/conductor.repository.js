import Conductor from "./conductor.model.js";

class ConductorRepository {

    // ==========================
    // Crear
    // ==========================

    async crear(datosConductor) {

        return await Conductor.create(
            datosConductor
        );

    }

    // ==========================
    // Obtener todos
    // ==========================

    async obtenerTodos() {

        return await Conductor.find({

            estado: true

        })

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })

            .sort({
                createdAt: -1
            });

    }

    // ==========================
    // Obtener por id
    // ==========================

    async obtenerPorId(id) {

        return await Conductor.findOne({

            _id: id,
            estado: true

        })

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    // ==========================
    // Buscar por usuario
    // ==========================

    async obtenerPorUsuario(usuarioId) {

        return await Conductor.findOne({

            usuario: usuarioId,
            estado: true

        })

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    // ==========================
    // Buscar licencia
    // ==========================

    async obtenerPorLicencia(licencia) {

        return await Conductor.findOne({

            licencia,
            estado: true

        });

    }

    // ==========================
    // Actualizar
    // ==========================

    async actualizar(id, datosConductor) {

        return await Conductor.findOneAndUpdate(

            {

                _id: id,
                estado: true

            },

            datosConductor,

            {

                new: true,
                runValidators: true

            }

        )

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    // ==========================
    // Eliminar lógico
    // ==========================

    async eliminar(id) {

        return await Conductor.findByIdAndUpdate(

            id,

            {

                estado: false

            },

            {

                new: true

            }

        );

    }

    // ==========================
    // Disponibilidad
    // ==========================

    async cambiarDisponibilidad(
        id,
        disponible
    ) {

        return await Conductor.findOneAndUpdate(

            {

                _id: id,
                estado: true

            },

            {

                disponible

            },

            {

                new: true,
                runValidators: true

            }

        )

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

    // ==========================
    // Disponibles
    // ==========================

    async obtenerDisponibles() {

        return await Conductor.find({

            estado: true,
            disponible: true

        })

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })

            .sort({

                createdAt: -1

            });

    }

    // ==========================
    // Actualizar licencia
    // ==========================

    async actualizarLicencia(
        id,
        datosLicencia
    ) {

        return await Conductor.findOneAndUpdate(

            {

                _id: id,
                estado: true

            },

            datosLicencia,

            {

                new: true,
                runValidators: true

            }

        )

            .populate({
                path: "usuario",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });

    }

}

export default new ConductorRepository();