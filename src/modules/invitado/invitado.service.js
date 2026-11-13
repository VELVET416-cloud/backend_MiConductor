import InvitadoRepository from "./invitado.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import UsuarioHelper from "../usuario/usuario.helper.js";
import ClienteRepository from "../cliente/cliente.repository.js";
import VehiculoRepository from "../vehiculo/vehiculo.repository.js";
import RolRepository from "../rol/rol.repository.js";
import AppError from "../../utils/AppError.js";

class InvitadoService {

    // ======================================================
    // CREAR SOLICITUD COMO INVITADO
    // ======================================================

    async crearSolicitud(datos) {

        const codigo = await this.generarCodigoUnico();
        const esParaTercero = Boolean(datos.esParaTercero);
        const beneficiario = datos.beneficiario || null;
        const solicitante = esParaTercero ? (datos.solicitante || null) : null;
        const vehiculoDatos = datos.vehiculo || null;

        // 1. Obtener o registrar Usuario y Cliente en base de datos
        let clienteId = null;
        let correoCliente = "invitado@miconductor.com";

        const personaPrincipal = beneficiario || solicitante;

        if (personaPrincipal && personaPrincipal.documento) {
            correoCliente = personaPrincipal.correo || correoCliente;
            try {
                // Verificar si el usuario ya existe por documento o correo
                let usuario = await UsuarioRepository.obtenerPorDocumento(
                    personaPrincipal.documento,
                    personaPrincipal.tipoDocumento
                );

                if (!usuario && personaPrincipal.correo) {
                    usuario = await UsuarioRepository.obtenerPorCorreo(personaPrincipal.correo);
                }

                if (!usuario) {
                    // Obtener rol CLIENTE
                    let rolCliente = await RolRepository.obtenerPorNombre("CLIENTE");
                    if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("CLIENTES");
                    if (!rolCliente) rolCliente = await RolRepository.obtenerPorNombre("Cliente");

                    const nombreCompleto = (personaPrincipal.nombreCompleto || "").trim();
                    const partesNombre = nombreCompleto.split(" ");
                    const nombre = partesNombre[0] || "Invitado";
                    const apellido = partesNombre.slice(1).join(" ") || "Cliente";

                    usuario = await UsuarioHelper.crear({
                        nombre,
                        apellido,
                        tipoDocumento: personaPrincipal.tipoDocumento || "CC",
                        documento: personaPrincipal.documento.trim(),
                        correo: personaPrincipal.correo ? personaPrincipal.correo.trim().toLowerCase() : `invitado_${Date.now()}@miconductor.com`,
                        password: personaPrincipal.documento.trim(),
                        telefono: personaPrincipal.telefono || "0000000",
                        rol: rolCliente ? rolCliente._id : null
                    });
                }

                if (usuario) {
                    // Verificar si ya tiene registro de Cliente
                    let cliente = await ClienteRepository.obtenerPorUsuario(usuario._id);
                    if (!cliente) {
                        cliente = await ClienteRepository.crear({
                            usuario: usuario._id,
                            direccion: datos.origen || "Medellín"
                        });
                    }
                    if (cliente) {
                        clienteId = cliente._id;
                    }
                }
            } catch (errPersona) {
                console.error("Error al registrar o verificar usuario/cliente de invitado:", errPersona);
            }
        }

        // 2. Obtener o registrar Vehículo en base de datos
        let vehiculoId = null;
        if (vehiculoDatos && vehiculoDatos.placa) {
            try {
                const placaUpper = vehiculoDatos.placa.trim().toUpperCase();
                let vehiculoExistente = await VehiculoRepository.obtenerPorPlaca(placaUpper);

                if (!vehiculoExistente && clienteId) {
                    // Crear nuevo vehículo asociado al cliente
                    const fotos = [
                        vehiculoDatos.documentos?.tarjetaPropiedad,
                        vehiculoDatos.documentos?.soat,
                        vehiculoDatos.documentos?.tecnomecanica
                    ].filter(Boolean);

                    vehiculoExistente = await VehiculoRepository.crear({
                        cliente: clienteId,
                        marca: vehiculoDatos.marca ? vehiculoDatos.marca.trim() : "N/A",
                        modelo: vehiculoDatos.modelo ? vehiculoDatos.modelo.trim() : "N/A",
                        placa: placaUpper,
                        anio: vehiculoDatos.anio ? Number(vehiculoDatos.anio) : new Date().getFullYear(),
                        color: vehiculoDatos.color ? vehiculoDatos.color.trim() : "N/A",
                        tipoVehiculo: vehiculoDatos.tipoVehiculo || "Automóvil",
                        tarjetaPropiedad: vehiculoDatos.documentos?.tarjetaPropiedad || null,
                        certificadoSoat: vehiculoDatos.documentos?.soat || null,
                        certificadoTecnicoMecanica: vehiculoDatos.documentos?.tecnomecanica || null,
                        fotos,
                        estado: true,
                        estadoVehiculo: "activo"
                    });
                }

                if (vehiculoExistente) {
                    vehiculoId = vehiculoExistente._id;
                }
            } catch (errVehiculo) {
                console.error("Error al registrar o verificar vehículo de invitado:", errVehiculo);
            }
        }

        // 3. Crear Solicitud vinculada
        const solicitudInvitado = await InvitadoRepository.crearSolicitud({
            codigo,
            cliente: clienteId,
            vehiculo: vehiculoId,
            esInvitado: true,
            esParaTercero,
            beneficiario,
            solicitante,
            correoCliente,
            vehiculoInfo: vehiculoDatos,
            tipoServicio: (datos.tipoServicio || "Transporte Ejecutivo").trim(),
            descripcion: (datos.descripcion || `Solicitud de servicio: ${datos.origen} hacia ${datos.destino}`).trim(),
            origen: datos.origen.trim(),
            destino: datos.destino.trim(),
            fechaProgramada: datos.fechaProgramada || new Date(),
            prioridad: (datos.prioridad || "MEDIA").trim().toUpperCase(),
            estado: "PENDIENTE",
            conductorAsignado: null
        });

        return this.mapearRespuestaPublica(solicitudInvitado);
    }

    // ======================================================
    // CONSULTAR SOLICITUD POR CÓDIGO
    // ======================================================

    async consultarSolicitudPorCodigo(codigo) {

        const solicitud = await InvitadoRepository.obtenerSolicitudPorCodigo(
            codigo.trim().toUpperCase()
        );

        if (!solicitud) {
            throw new AppError("Solicitud no encontrada.", 404);
        }

        return this.mapearRespuestaPublica(solicitud);

    }

    async generarCodigoUnico() {

        const intentosMaximos = 10;

        for (let intento = 0; intento < intentosMaximos; intento += 1) {
            const codigo = `INV-${Date.now()}-${Math.floor(
                1000 + Math.random() * 9000
            )}`;

            const existe =
                await InvitadoRepository.obtenerSolicitudPorCodigo(codigo);

            if (!existe) {
                return codigo;
            }
        }

        throw new AppError(
            "No fue posible generar el código de la solicitud. Intente nuevamente.",
            500
        );

    }

    mapearRespuestaPublica(solicitud) {
        const conductorAsignado = solicitud.conductorAsignado
            ? {
                id: solicitud.conductorAsignado._id,
                nombre: solicitud.conductorAsignado.usuario?.nombre || null,
                apellido: solicitud.conductorAsignado.usuario?.apellido || null
            }
            : null;

        return {
            id: solicitud._id,
            _id: solicitud._id,
            codigo: solicitud.codigo,
            cliente: solicitud.cliente,
            vehiculo: solicitud.vehiculo,
            correoCliente: solicitud.correoCliente,
            estado: solicitud.estado,
            esInvitado: solicitud.esInvitado ?? true,
            esParaTercero: solicitud.esParaTercero ?? false,
            beneficiario: solicitud.beneficiario,
            solicitante: solicitud.solicitante,
            vehiculoInfo: solicitud.vehiculoInfo,
            origen: solicitud.origen,
            destino: solicitud.destino,
            tipoServicio: solicitud.tipoServicio,
            descripcion: solicitud.descripcion,
            fechaProgramada: solicitud.fechaProgramada,
            prioridad: solicitud.prioridad,
            conductorAsignado,
            createdAt: solicitud.createdAt,
            updatedAt: solicitud.updatedAt
        };
    }

}

export default new InvitadoService();
