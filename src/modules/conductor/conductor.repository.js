import Conductor from "./conductor.model.js";

class ConductorRepository {
    async crear(datosConductor) {
        return await Conductor.create(datosConductor);
    }

    // Obtener todos los conductores para gestión administrativa
    // Permite consultar activos, inactivos, retirados, etc.
    async obtenerTodos(filtro = {}) {
        return await Conductor.find(filtro)
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .populate({
                path: "usuarioCambioEstado",
                select: "nombre apellido nombreCompleto correo"
            })
            .sort({
                createdAt: -1
            });
    }

    async obtenerPorId(id) {
        return await Conductor.findById(id)
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .populate({
                path: "usuarioCambioEstado",
                select: "nombre apellido nombreCompleto correo"
            });
    }

    async obtenerPorUsuario(usuarioId) {
        return await Conductor.findOne({
            usuario: usuarioId
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });
    }

    async obtenerPorLicencia(licencia) {
        return await Conductor.findOne({
            licencia: (licencia || "").trim()
        });
    }

    async actualizar(id, datosConductor) {
        return await Conductor.findByIdAndUpdate(
            id,
            datosConductor,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });
    }

    async cambiarEstadoAdministrativo(id, { estadoConductor, motivo, usuarioId }) {
        const updateData = {
            estadoConductor,
            motivoCambioEstado: motivo || null,
            fechaCambioEstado: new Date(),
            usuarioCambioEstado: usuarioId || null,
            estado: estadoConductor === "ACTIVO"
        };

        if (estadoConductor !== "ACTIVO") {
            updateData.disponible = false;
        }

        return await Conductor.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });
    }

    // Eliminación lógica (marca como inactivo)
    async eliminar(id) {
        return await Conductor.findByIdAndUpdate(
            id,
            {
                estado: false,
                estadoConductor: "INACTIVO",
                disponible: false
            },
            {
                new: true
            }
        );
    }

    // Eliminación física real (cuando no existen dependencias relacionales)
    async eliminarFisico(id) {
        return await Conductor.findByIdAndDelete(id);
    }

    async cambiarDisponibilidad(id, disponible) {
        return await Conductor.findByIdAndUpdate(
            id,
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
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });
    }

    async obtenerDisponibles() {
        return await Conductor.find({
            estado: true,
            estadoConductor: "ACTIVO",
            disponible: true
        })
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            })
            .sort({
                createdAt: -1
            });
    }

    async actualizarLicencia(id, datosLicencia) {
        return await Conductor.findByIdAndUpdate(
            id,
            datosLicencia,
            {
                new: true,
                runValidators: true
            }
        )
            .populate({
                path: "usuario",
                select: "-password -resetPasswordToken -resetPasswordExpires",
                populate: {
                    path: "rol",
                    select: "nombre descripcion"
                }
            });
    }
}

export default new ConductorRepository();
