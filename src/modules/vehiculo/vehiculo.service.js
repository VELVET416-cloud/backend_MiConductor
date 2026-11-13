import mongoose from "mongoose";

import VehiculoRepository from "./vehiculo.repository.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import AppError from "../../utils/AppError.js";

class VehiculoService {

    // Crear vehículo
    async crear(datos) {

        // Normalizar
        datos.marca = datos.marca.trim();
        datos.modelo = datos.modelo.trim();
        datos.placa = datos.placa.trim().toUpperCase();
        if (datos.numeroChasis && typeof datos.numeroChasis === "string" && datos.numeroChasis.trim() !== "") {
            datos.numeroChasis = datos.numeroChasis.trim().toUpperCase();
        } else {
            datos.numeroChasis = null;
        }
        datos.color = datos.color.trim();

        // Validar cliente
        if (!mongoose.Types.ObjectId.isValid(datos.cliente)) {
            throw new AppError(
                "El cliente enviado no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(
            datos.cliente
        );

        // Si no se encontró por ID de Cliente, intentar buscar por ID de Usuario
        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(datos.cliente);
        }

        if (!cliente) {
            throw new AppError(
                "El cliente no existe.",
                404
            );
        }

        // Asegurarnos de guardar con el ID correcto del Cliente
        datos.cliente = cliente._id;

        // Validar placa
        const vehiculoExistente =
            await VehiculoRepository.obtenerPorPlaca(
                datos.placa
            );

        if (vehiculoExistente) {
            const estadoActual = vehiculoExistente.estadoVehiculo || (vehiculoExistente.estado ? 'activo' : 'inactivo');

            // Si el vehículo está activo o en mantenimiento o inactivo (diferente de vendido)
            if (estadoActual !== 'vendido') {
                throw new AppError(
                    "Lo sentimos, el vehículo ya se encuentra registrado en la plataforma y está activo con otro conductor. Por favor, comunícate con la persona para que le dé de baja a su vehículo.",
                    409
                );
            }

            // Si el vehículo está en estatus 'vendido', el nuevo propietario puede registrarlo:
            // Es obligatorio presentar la nueva tarjeta de propiedad a nombre del nuevo dueño
            if (!datos.tarjetaPropiedad && !datos.tarjetaCirculacion) {
                throw new AppError(
                    "Para registrar este vehículo vendido, es obligatorio subir la nueva tarjeta de propiedad.",
                    400
                );
            }

            const datosActualizacion = {
                cliente: datos.cliente,
                tarjetaPropiedad: datos.tarjetaPropiedad || datos.tarjetaCirculacion || vehiculoExistente.tarjetaPropiedad,
                fechaVencimientoSoat: datos.fechaVencimientoSoat || vehiculoExistente.fechaVencimientoSoat,
                fechaVencimientoTecnomecanica: datos.fechaVencimientoTecnomecanica || vehiculoExistente.fechaVencimientoTecnomecanica,
                estadoVehiculo: 'activo',
                estado: true,
                motivoCambioEstado: 'Vehículo reactivado y transferido a nuevo propietario'
            };

            if (datos.foto1) datosActualizacion.foto1 = datos.foto1;
            if (datos.foto2) datosActualizacion.foto2 = datos.foto2;
            if (datos.foto3) datosActualizacion.foto3 = datos.foto3;
            if (datos.fotos && datos.fotos.length > 0) datosActualizacion.fotos = datos.fotos;

            // Actualizar datos del vehículo y agregar al historial
            const vehiculoActualizado = await VehiculoRepository.actualizar(
                vehiculoExistente._id,
                datosActualizacion
            );

            await VehiculoRepository.cambiarEstado(vehiculoExistente._id, {
                estadoNuevo: 'activo',
                motivo: 'Vehículo transferido y registrado por nuevo propietario',
                estadoAnterior: 'vendido'
            });

            return vehiculoActualizado;
        }

        // Validar chasis si es vehículo nuevo
        if (datos.numeroChasis) {
            const chasisExiste =
                await VehiculoRepository.obtenerPorChasis(
                    datos.numeroChasis
                );

            if (chasisExiste) {
                throw new AppError(
                    "Ya existe un vehículo con ese número de chasis.",
                    409
                );
            }
        }

        datos.estadoVehiculo = 'activo';
        datos.estado = true;
        datos.historialEstados = [
            {
                estadoAnterior: null,
                estadoNuevo: 'activo',
                motivo: 'Registro inicial del vehículo',
                fecha: new Date()
            }
        ];

        return await VehiculoRepository.crear(datos);

    }

    // Obtener todos
    async obtenerTodos(page, limit, search, estado) {

        return await VehiculoRepository.obtenerTodos(page, limit, search, estado);

    }

    // Obtener por ID
    async obtenerPorId(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        return vehiculo;

    }

    // Obtener vehículos por cliente
    async obtenerPorCliente(clienteId) {

        if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            throw new AppError(
                "El id del cliente no es válido.",
                400
            );
        }

        let cliente = await ClienteRepository.obtenerPorId(clienteId);
        if (!cliente) {
            cliente = await ClienteRepository.obtenerPorUsuario(clienteId);
        }

        const idReal = cliente ? cliente._id : clienteId;

        return await VehiculoRepository.obtenerPorCliente(
            idReal
        );

    }

    // Actualizar
    async actualizar(id, datos) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        if (datos.cliente) {
            let cliente = await ClienteRepository.obtenerPorId(datos.cliente);
            if (!cliente) {
                cliente = await ClienteRepository.obtenerPorUsuario(datos.cliente);
            }
            if (!cliente) {
                throw new AppError("El cliente no existe.", 404);
            }
            datos.cliente = cliente._id;
        }

        if (datos.marca)
            datos.marca = datos.marca.trim();

        if (datos.modelo)
            datos.modelo = datos.modelo.trim();

        if (datos.color)
            datos.color = datos.color.trim();

        if (datos.placa) {

            datos.placa = datos.placa.trim().toUpperCase();

            if (datos.placa !== vehiculo.placa) {

                const placaExiste =
                    await VehiculoRepository.obtenerPorPlaca(
                        datos.placa
                    );

                if (placaExiste) {
                    throw new AppError(
                        "Ya existe un vehículo con esa placa.",
                        409
                    );
                }

            }

        }

        if (datos.numeroChasis !== undefined) {
            if (datos.numeroChasis && typeof datos.numeroChasis === "string" && datos.numeroChasis.trim() !== "") {
                datos.numeroChasis = datos.numeroChasis.trim().toUpperCase();

                if (datos.numeroChasis !== vehiculo.numeroChasis) {
                    const chasisExiste =
                        await VehiculoRepository.obtenerPorChasis(
                            datos.numeroChasis
                        );

                    if (chasisExiste) {
                        throw new AppError(
                            "Ya existe un vehículo con ese número de chasis.",
                            409
                        );
                    }
                }
            } else {
                datos.numeroChasis = null;
            }
        }

        return await VehiculoRepository.actualizar(
            id,
            datos
        );

    }

    // Eliminar
    async eliminar(id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                "El id del vehículo no es válido.",
                400
            );
        }

        const vehiculo =
            await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError(
                "Vehículo no encontrado.",
                404
            );
        }

        const solicitudes = await SolicitudRepository.obtenerPorVehiculo(id);

        if (solicitudes && solicitudes.length > 0) {
            throw new AppError("El vehículo tiene solicitudes de servicio registradas y no puede ser eliminado.", 400);
        }

        // Eliminación física
        await VehiculoRepository.eliminarFisico(id);

        return;

    }

    // Verificar disponibilidad de placa
    async verificarPlaca(placa) {
        if (!placa || typeof placa !== 'string') {
            throw new AppError("La placa es obligatoria.", 400);
        }

        const placaLimpia = placa.trim().toUpperCase();

        const vehiculo = await VehiculoRepository.obtenerPorPlaca(placaLimpia);

        if (!vehiculo) {
            return {
                existe: false,
                permitido: true,
                mensaje: "La placa está disponible para registro.",
                vehiculo: null
            };
        }

        const estadoVehiculo = vehiculo.estadoVehiculo || (vehiculo.estado ? 'activo' : 'inactivo');

        if (estadoVehiculo === 'vendido') {
            return {
                existe: true,
                permitido: true,
                estadoVehiculo: 'vendido',
                mensaje: "El vehículo fue marcado como vendido por su anterior dueño. Puedes registrarlo como nuevo propietario actualizando la tarjeta de propiedad y fechas.",
                vehiculo: {
                    _id: vehiculo._id,
                    placa: vehiculo.placa,
                    marca: vehiculo.marca,
                    modelo: vehiculo.modelo,
                    anio: vehiculo.anio,
                    color: vehiculo.color,
                    tipoVehiculo: vehiculo.tipoVehiculo,
                    numeroChasis: vehiculo.numeroChasis,
                    tipoCombustible: vehiculo.tipoCombustible,
                    numeroPuertas: vehiculo.numeroPuertas,
                    estadoVehiculo: 'vendido'
                }
            };
        }

        return {
            existe: true,
            permitido: false,
            estadoVehiculo,
            mensaje: "Lo sentimos, el vehículo ya se encuentra registrado en la plataforma y está activo con otro conductor. Por favor, comunícate con la persona para que le dé de baja a su vehículo.",
            vehiculo: {
                _id: vehiculo._id,
                placa: vehiculo.placa,
                marca: vehiculo.marca,
                modelo: vehiculo.modelo,
                estadoVehiculo
            }
        };
    }

    // Cambiar estado del vehículo
    async cambiarEstado(id, nuevoEstado, motivo) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id del vehículo no es válido.", 400);
        }

        const vehiculo = await VehiculoRepository.obtenerPorId(id);

        if (!vehiculo) {
            throw new AppError("Vehículo no encontrado.", 404);
        }

        const estadosValidos = ["activo", "en_mantenimiento", "vendido", "inactivo"];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new AppError("El estado especificado no es válido.", 400);
        }

        if (["en_mantenimiento", "vendido", "inactivo"].includes(nuevoEstado)) {
            if (!motivo || motivo.trim().length < 3) {
                throw new AppError("El motivo del cambio de estado es obligatorio y debe tener al menos 3 caracteres.", 400);
            }
        }

        const estadoAnterior = vehiculo.estadoVehiculo || (vehiculo.estado ? 'activo' : 'inactivo');

        return await VehiculoRepository.cambiarEstado(id, {
            estadoNuevo: nuevoEstado,
            motivo: motivo ? motivo.trim() : null,
            estadoAnterior
        });
    }

}

export default new VehiculoService();