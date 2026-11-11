import mongoose from "mongoose";

import NovedadRepository from "./novedad.repository.js";
import SolicitudRepository from "../solicitud/solicitud.repository.js";
import ConductorRepository from "../conductor/conductor.repository.js";
import UsuarioRepository from "../usuario/usuario.repository.js";
import { notificacionEventBus, NOTIFICACION_EVENTOS } from "../notificacion/notificacion.events.js";

import AppError from "../../utils/AppError.js";

// ======================================================
// ASIGNACIÓN AUTOMÁTICA DE PRIORIDAD POR TIPO DE NOVEDAD
// ======================================================
export function calcularPrioridadAutomatica(tipo, severidadEnviada) {
    const tipoNorm = (tipo || "").trim().toUpperCase();

    // Prioridad Alta:
    // - Accidente
    // - Falla mecánica grave
    // - Emergencias médicas, robo, bloqueo total, salud
    if ([
        "ACCIDENTE",
        "FALLA_MECANICA_GRAVE",
        "FALLA_MECANICA",
        "EMERGENCIA_MEDICA",
        "ROBO_ASALTO",
        "BLOQUEO_TOTAL_VIA",
        "MECANICA",
        "SALUD"
    ].includes(tipoNorm)) {
        return "ALTA";
    }

    // Prioridad Media:
    // - Tráfico pesado
    // - Controles o retenes de autoridad
    // - Cambio de ruta
    // - Desvíos por obras, clima adverso, pinchazo
    if ([
        "TRAFICO_PESADO",
        "CONTROLES_RETENES",
        "RETEN_AUTORIDAD",
        "CAMBIO_RUTA",
        "DESVIO_OBRAS",
        "CLIMA_ADVERSO",
        "PINCHAZO_LLANTA",
        "VIAL",
        "CLIENTE"
    ].includes(tipoNorm)) {
        return "MEDIA";
    }

    // Prioridad Baja:
    // - Tráfico leve
    // - Gasolina baja
    // - Retraso del cliente, parada no programada, info general
    if ([
        "TRAFICO_LEVE",
        "GASOLINA_BAJA",
        "COMBUSTIBLE_BAJO",
        "RETRASO_CLIENTE",
        "PARADA_NO_PROGRAMADA",
        "INFO_RUTA",
        "ADMINISTRATIVA"
    ].includes(tipoNorm)) {
        return "BAJA";
    }

    // Nota: Si desde la app móvil se selecciona la opción "OTRO" / "OTROS",
    // el conductor podrá enviar la prioridad y el motivo correspondiente.
    if (tipoNorm === "OTRO" || tipoNorm === "OTROS" || !tipoNorm) {
        if (severidadEnviada) {
            const sev = String(severidadEnviada).trim().toUpperCase();
            if (["BAJA", "MEDIA", "ALTA", "CRITICA", "URGENTE"].includes(sev)) {
                return sev;
            }
        }
        return "MEDIA";
    }

    return "MEDIA";
}

class NovedadService {

    // ======================================================
    // CREAR NOVEDAD
    // ======================================================
    async crear(datos) {
        datos.tipo = (datos.tipo || "OTRO").trim().toUpperCase();
        datos.titulo = (datos.titulo || `Novedad: ${datos.tipo}`).trim();
        datos.descripcion = (datos.descripcion || "Novedad reportada en el servicio.").trim();

        // 1. Asignar prioridad/severidad (si se envió, respetarla; si no, calcularla automáticamente)
        if (datos.severidad && typeof datos.severidad === "string" && datos.severidad.trim()) {
            datos.severidad = datos.severidad.trim().toUpperCase();
        } else {
            datos.severidad = calcularPrioridadAutomatica(
                datos.tipo,
                datos.severidad || datos.prioridad
            );
        }

        // 2. Estado inicial: respetar el enviado o asignar "POR_REVISAR" por defecto
        datos.estadoNovedad = (datos.estadoNovedad || "POR_REVISAR").trim().toUpperCase();

        if (datos.observaciones !== null && datos.observaciones !== undefined && datos.observaciones.trim) {
            datos.observaciones = datos.observaciones.trim();
        }

        if (datos.motivoOtro !== null && datos.motivoOtro !== undefined && datos.motivoOtro.trim) {
            datos.motivoOtro = datos.motivoOtro.trim();
        }

        // 3. Normalizar ubicación GPS actual (latitud y longitud)
        let lat = null;
        let lng = null;
        let direccion = null;

        if (datos.ubicacion && typeof datos.ubicacion === "object") {
            lat = Number(datos.ubicacion.lat ?? datos.ubicacion.latitude);
            lng = Number(datos.ubicacion.lng ?? datos.ubicacion.longitude);
            direccion = datos.ubicacion.direccion || null;
        } else if (typeof datos.ubicacion === "string") {
            direccion = datos.ubicacion.trim();
            const coordMatch = direccion.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
            if (coordMatch) {
                lat = Number(coordMatch[1]);
                lng = Number(coordMatch[3]);
            }
        }

        if (datos.latitud != null) lat = Number(datos.latitud);
        if (datos.longitud != null) lng = Number(datos.longitud);
        if (datos.lat != null) lat = Number(datos.lat);
        if (datos.lng != null) lng = Number(datos.lng);

        datos.ubicacion = {
            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,
            direccion: direccion || (Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : null)
        };

        // 4. Fotos de evidencia
        const fotos = [];
        if (Array.isArray(datos.fotosEvidencia)) {
            datos.fotosEvidencia.forEach(f => {
                if (typeof f === "string" && f.trim()) {
                    fotos.push(f.trim());
                }
            });
        }
        if (datos.evidenciaUrl && typeof datos.evidenciaUrl === "string" && datos.evidenciaUrl.trim()) {
            const ev = datos.evidenciaUrl.trim();
            if (!fotos.includes(ev)) {
                fotos.unshift(ev);
            }
        }
        datos.fotosEvidencia = fotos;
        datos.evidenciaUrl = fotos[0] || null;

        // 5. Validar solicitud y gestionar Trazabilidad / Cambio de ruta
        let solicitudDoc = null;
        if (datos.solicitud) {
            if (!mongoose.Types.ObjectId.isValid(datos.solicitud)) {
                throw new AppError("La solicitud enviada no es válida.", 400);
            }

            solicitudDoc = await SolicitudRepository.obtenerPorId(datos.solicitud);

            if (!solicitudDoc) {
                throw new AppError("La solicitud no existe.", 404);
            }

            // Si no se envió conductor explícito, tomar el conductor de la solicitud
            if (!datos.conductor && solicitudDoc.conductorAsignado) {
                datos.conductor = solicitudDoc.conductorAsignado;
            }
        }

        // Trazabilidad de "Cambio de ruta":
        // Si el tipo de novedad es "Cambio de ruta", registrar obligatoriamente la ruta inicial del servicio y la nueva ruta generada
        if (datos.tipo === "CAMBIO_RUTA") {
            const origenInicial = datos.rutaInicial?.origen || solicitudDoc?.origen || "Punto de partida";
            const destinoInicial = datos.rutaInicial?.destino || solicitudDoc?.destino || "Destino programado";

            datos.rutaInicial = {
                origen: origenInicial,
                destino: destinoInicial,
                coordenadas: Array.isArray(datos.rutaInicial?.coordenadas) ? datos.rutaInicial.coordenadas : [],
                polyline: datos.rutaInicial?.polyline || null
            };

            const origenNuevo = datos.rutaNueva?.origen || datos.ubicacion?.direccion || origenInicial;
            const destinoNuevo = datos.rutaNueva?.destino || datos.nuevoDestino || "Nuevo destino en ruta";

            datos.rutaNueva = {
                origen: origenNuevo,
                destino: destinoNuevo,
                coordenadas: Array.isArray(datos.rutaNueva?.coordenadas) ? datos.rutaNueva.coordenadas : [],
                polyline: datos.rutaNueva?.polyline || null
            };
        }

        // 6. Validar conductor (si existe)
        if (datos.conductor) {
            if (!mongoose.Types.ObjectId.isValid(datos.conductor)) {
                throw new AppError("El conductor enviado no es válido.", 400);
            }

            const conductor = await ConductorRepository.obtenerPorId(datos.conductor);

            if (!conductor) {
                throw new AppError("El conductor no existe.", 404);
            }
        }

        // 7. Validar usuarioRegistro (obligatorio)
        if (!mongoose.Types.ObjectId.isValid(datos.usuarioRegistro)) {
            throw new AppError("El usuario de registro enviado no es válido.", 400);
        }

        const usuario = await UsuarioRepository.obtenerPorId(datos.usuarioRegistro);

        if (!usuario) {
            throw new AppError("El usuario de registro no existe.", 404);
        }

        if (datos.estadoNovedad === "RESUELTO" || datos.estadoNovedad === "RESUELTA" || datos.estadoNovedad === "CERRADO") {
            if (!datos.fechaCierre) {
                datos.fechaCierre = new Date();
            }
        }

        const novedad = await NovedadRepository.crear(datos);

        notificacionEventBus.emit(NOTIFICACION_EVENTOS.NOVEDAD_REPORTADA, novedad);

        return await NovedadRepository.obtenerPorId(novedad._id);
    }

    // ======================================================
    // OBTENER TODAS LAS NOVEDADES
    // ======================================================
    async obtenerTodos() {
        return await NovedadRepository.obtenerTodos();
    }

    // ======================================================
    // OBTENER POR ID
    // ======================================================
    async obtenerPorId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id de la novedad no es válido.", 400);
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        return novedad;
    }

    // ======================================================
    // OBTENER POR SOLICITUD
    // ======================================================
    async obtenerPorSolicitud(solicitudId) {
        if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
            throw new AppError("El id de la solicitud no es válido.", 400);
        }

        return await NovedadRepository.obtenerPorSolicitud(solicitudId);
    }

    // ======================================================
    // OBTENER POR CONDUCTOR
    // ======================================================
    async obtenerPorConductor(conductorId) {
        if (!mongoose.Types.ObjectId.isValid(conductorId)) {
            throw new AppError("El id del conductor no es válido.", 400);
        }

        return await NovedadRepository.obtenerPorConductor(conductorId);
    }

    // ======================================================
    // ACTUALIZAR NOVEDAD
    // ======================================================
    async actualizar(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id de la novedad no es válido.", 400);
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        if (datos.tipo) {
            datos.tipo = datos.tipo.trim().toUpperCase();
            datos.severidad = calcularPrioridadAutomatica(
                datos.tipo,
                datos.severidad || datos.prioridad || novedad.severidad
            );
        }

        const estadoFinal = datos.estadoNovedad || novedad.estadoNovedad;

        if (estadoFinal === "RESUELTO" || estadoFinal === "RESUELTA" || estadoFinal === "CERRADO" || estadoFinal === "CERRADA") {
            if (!datos.fechaCierre && !novedad.fechaCierre) {
                datos.fechaCierre = new Date();
            }
        }

        return await NovedadRepository.actualizar(id, datos);
    }

    // ======================================================
    // CAMBIAR ESTADO DE LA NOVEDAD (Con historial y notas)
    // ======================================================
    async cambiarEstado(id, estadoNovedad, observaciones = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id de la novedad no es válido.", 400);
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        const nuevoEstadoNorm = estadoNovedad.trim().toUpperCase();

        const datosActualizar = {
            estadoNovedad: nuevoEstadoNorm
        };

        const textoObservaciones = (typeof observaciones === "string" ? observaciones : "").trim();

        // Regla: Para pasar al estado "REVISADO", el administrador debe dejar una nota obligatoria
        // (mínimo 5 caracteres) que describe la solución aplicada a la novedad.
        if (nuevoEstadoNorm === "REVISADO" || nuevoEstadoNorm === "RESUELTO" || nuevoEstadoNorm === "RESUELTA") {
            if (!textoObservaciones || textoObservaciones.length < 5) {
                throw new AppError(
                    "Debes ingresar la descripción de la solución de la novedad (mínimo 5 caracteres) para marcarla como revisada.",
                    400
                );
            }

            datosActualizar.estadoNovedad = "REVISADO";
            datosActualizar.fechaCierre = new Date();
            datosActualizar.notasResolucion = textoObservaciones;
            datosActualizar.observaciones = textoObservaciones;
        }

        // Mantener historial consultable de notas
        if (textoObservaciones) {
            const nuevaEntradaHistorial = {
                autor: "Administrador",
                estadoAnterior: novedad.estadoNovedad,
                nuevoEstado: nuevoEstadoNorm,
                nota: textoObservaciones,
                fecha: new Date()
            };

            datosActualizar.historialNotas = [
                ...(novedad.historialNotas || []),
                nuevaEntradaHistorial
            ];
        }

        return await NovedadRepository.cambiarEstado(
            id,
            datosActualizar
        );
    }

    // ======================================================
    // ELIMINAR NOVEDAD (Desactivación lógica)
    // ======================================================
    async eliminar(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("El id de la novedad no es válido.", 400);
        }

        const novedad = await NovedadRepository.obtenerPorId(id);

        if (!novedad) {
            throw new AppError("Novedad no encontrada.", 404);
        }

        await NovedadRepository.eliminar(id);
        return;
    }
}

export default new NovedadService();
