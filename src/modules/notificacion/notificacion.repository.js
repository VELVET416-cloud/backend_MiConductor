import Notificacion from "./notificacion.model.js";
import Dispositivo from "./dispositivo.model.js";

const populateNotificacion = [
    {
        path: "solicitud",
        select: "codigo tipoServicio estado prioridad origen destino"
    },
    {
        path: "servicio",
        select: "estado fechaInicio fechaFin"
    },
    {
        path: "novedad",
        select: "titulo severidad tipo estadoNovedad"
    }
];

class NotificacionRepository {

    // ======================================================
    // NOTIFICACIONES
    // ======================================================

    async crear(datos) {
        const notificacion = await Notificacion.create(datos);
        return await notificacion.populate(populateNotificacion);
    }

    async crearMuchos(lista) {
        return await Notificacion.insertMany(lista);
    }

    async obtenerPorId(id) {
        return await Notificacion.findById(id).populate(populateNotificacion);
    }

    async listarPorUsuario(usuarioId, { page = 1, limit = 20, leida } = {}) {
        const filtro = { destinatario: usuarioId };

        if (typeof leida === "boolean") {
            filtro.leida = leida;
        }

        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            Notificacion.countDocuments(filtro),
            Notificacion.find(filtro)
                .populate(populateNotificacion)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        return {
            total,
            page,
            limit,
            totalPages,
            data
        };
    }

    async contarNoLeidas(usuarioId) {
        return await Notificacion.countDocuments({
            destinatario: usuarioId,
            leida: false
        });
    }

    async marcarComoLeida(id, usuarioId) {
        return await Notificacion.findOneAndUpdate(
            { _id: id, destinatario: usuarioId },
            { leida: true, fechaLectura: new Date() },
            { new: true }
        ).populate(populateNotificacion);
    }

    async marcarTodasComoLeidas(usuarioId) {
        return await Notificacion.updateMany(
            { destinatario: usuarioId, leida: false },
            { leida: true, fechaLectura: new Date() }
        );
    }

    // ======================================================
    // DISPOSITIVOS / TOKENS FCM
    // ======================================================

    async registrarDispositivo({ usuario, token, plataforma = "DESCONOCIDO" }) {
        return await Dispositivo.findOneAndUpdate(
            { token },
            {
                usuario,
                plataforma,
                activo: true,
                ultimoUso: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    async desvincularDispositivo(usuarioId, token) {
        return await Dispositivo.findOneAndDelete({
            usuario: usuarioId,
            token
        });
    }

    async obtenerTokensPorUsuario(usuarioId) {
        const dispositivos = await Dispositivo.find({
            usuario: usuarioId,
            activo: true
        }).select("token");

        return dispositivos.map(d => d.token);
    }

    async obtenerTokensPorUsuarios(usuariosIds) {
        const dispositivos = await Dispositivo.find({
            usuario: { $in: usuariosIds },
            activo: true
        }).select("token usuario");

        return dispositivos;
    }

    async eliminarTokensInvalidos(tokens) {
        if (!tokens || tokens.length === 0) return;
        return await Dispositivo.deleteMany({
            token: { $in: tokens }
        });
    }

}

export default new NotificacionRepository();

