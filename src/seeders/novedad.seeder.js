import mongoose from "mongoose";
import Novedad from "../modules/novedad/novedad.model.js";
import Solicitud from "../modules/solicitud/solicitud.model.js";
import Conductor from "../modules/conductor/conductor.model.js";
import Usuario from "../modules/usuario/usuario.model.js";

const DEFAULT_NOVEDADES = [
  {
    _id: "6af9100108b0384f9dd23030",
    titulo: "Congestión por manifestación y tráfico pesado",
    descripcion: "Se presenta alto flujo vehicular y bloqueo parcial en la Autopista Norte por manifestaciones ciudadanas. Se avanza a baja velocidad con precaución.",
    tipo: "TRAFICO_PESADO",
    severidad: "MEDIA",
    solicitudId: "6ae1e64c63b6221f0e60e150", // Solicitud en proceso
    conductorId: "6ab65ce8a289bce4956cbad8", // Carlos Alberto Ruiz
    usuarioRegistroId: "6ab65ce8a289bce4956cbad7", // Usuario de Carlos Ruiz
    estadoNovedad: "POR_REVISAR",
    ubicacion: {
      lat: 4.6985,
      lng: -74.0489,
      direccion: "Autopista Norte con Calle 100, Bogotá",
    },
    fotosEvidencia: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    ],
    estado: true,
  },
  {
    _id: "6af9100108b0384f9dd23031",
    titulo: "Pinchazo de neumático trasero derecho",
    descripcion: "El vehículo presentó pérdida súbita de presión en la llanta trasera derecha. Se orilló el vehículo con las luces de emergencia encendidas para cambiar la llanta por el repuesto.",
    tipo: "PINCHAZO_LLANTA",
    severidad: "ALTA",
    solicitudId: "6ae1e81b63b6221f0e60e157", // Solicitud en proceso
    conductorId: "6ab1cf25f0a4eff62e86c6f3", // Andrés Felipe Gómez
    usuarioRegistroId: "6ab1cf25f0a4eff62e86c6f2", // Usuario de Andrés Gómez
    estadoNovedad: "POR_REVISAR",
    ubicacion: {
      lat: 4.6725,
      lng: -74.0812,
      direccion: "Avenida El Dorado con Carrera 68, Bogotá",
    },
    fotosEvidencia: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    ],
    estado: true,
  },
  {
    _id: "6af9100108b0384f9dd23032",
    titulo: "Cambio de destino solicitado por el cliente",
    descripcion: "El cliente solicitó desviar la ruta hacia el Centro Comercial Andino para recoger a un acompañante antes de dirigirse hacia el destino final.",
    tipo: "CAMBIO_RUTA",
    severidad: "MEDIA",
    solicitudId: "6aeb500db9eb3278af7ef395", // Solicitud en proceso
    conductorId: "6ab65ce8a289bce4956cbad8",
    usuarioRegistroId: "6ab65ce8a289bce4956cbad7",
    estadoNovedad: "REVISADO",
    ubicacion: {
      lat: 4.656,
      lng: -74.056,
      direccion: "Carrera 7 con Calle 72, Bogotá",
    },
    rutaInicial: {
      origen: "Zona Rosa Calle 82, Bogotá",
      destino: "Mirador de La Calera, Cundinamarca",
    },
    rutaNueva: {
      origen: "Carrera 7 con Calle 72, Bogotá",
      destino: "Centro Comercial Andino, Bogotá",
    },
    historialNotas: [
      {
        autor: "Administrador",
        nota: "Se autorizó el cambio de destino previa confirmación con el cliente titular.",
        fecha: new Date(),
      },
    ],
    notasResolucion: "Ruta actualizada y aprobada. Servicio reanudado sin recargo adicional.",
    estado: true,
  },
  {
    _id: "6af9100108b0384f9dd23033",
    titulo: "Control y retén policial preventivo",
    descripcion: "Retén de la Policía Nacional de Tránsito sobre la calzada rápida. Inspección de rutina de documentación y botiquín de primeros auxilios.",
    tipo: "CONTROLES_RETENES",
    severidad: "BAJA",
    solicitudId: "6ad0de5b7e6195ad5a59ab32",
    conductorId: "6ab65ce8a289bce4956cbad8",
    usuarioRegistroId: "6ab65ce8a289bce4956cbad7",
    estadoNovedad: "RESUELTO",
    ubicacion: {
      lat: 4.75,
      lng: -74.03,
      direccion: "Autopista Norte con Calle 170, Bogotá",
    },
    notasResolucion: "Verificación de papeles completada satisfactoriamente en 10 minutos. Todo al día.",
    estado: true,
  },
  {
    _id: "6af9100108b0384f9dd23034",
    titulo: "Fuerte aguacero y visibilidad reducida",
    descripcion: "Precipitación intensa con encharcamiento temporal en la vía. Se reduce velocidad por protocolo de seguridad vial.",
    tipo: "CLIMA_ADVERSO",
    severidad: "MEDIA",
    solicitudId: "6ad236cc60f2c7f53b94811b",
    conductorId: "6ab65ce8a289bce4956cbad8",
    usuarioRegistroId: "6ab65ce8a289bce4956cbad7",
    estadoNovedad: "RESUELTO",
    ubicacion: {
      lat: 4.685,
      lng: -74.095,
      direccion: "Avenida Boyacá con Calle 53, Bogotá",
    },
    notasResolucion: "El trayecto continuó a velocidad preventiva y el cliente llegó a salvo al aeropuerto.",
    estado: true,
  },
  {
    _id: "6af9100108b0384f9dd23035",
    titulo: "Alerta por temperatura de motor elevada",
    descripcion: "El sensor de temperatura del motor emitió advertencia en el tablero. Se estacionó el vehículo en zona segura para verificar refrigerante.",
    tipo: "FALLA_MECANICA",
    severidad: "ALTA",
    solicitudId: "6aeb547b08b0384f9dd23041",
    conductorId: "6ab65ce8a289bce4956cbad8",
    usuarioRegistroId: "6ab65ce8a289bce4956cbad7",
    estadoNovedad: "POR_REVISAR",
    ubicacion: {
      lat: 4.66,
      lng: -74.06,
      direccion: "Carrera 15 con Calle 76, Bogotá",
    },
    fotosEvidencia: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    ],
    estado: true,
  },
];

export const seedNovedades = async () => {
  try {
    const totalNovedades = await Novedad.countDocuments();
    if (totalNovedades >= 5) {
      console.log(`ℹ Ya existen ${totalNovedades} novedades en la base de datos.`);
      return;
    }

    for (const n of DEFAULT_NOVEDADES) {
      const existe = await Novedad.findById(n._id);
      if (existe) continue;

      const solicitud = await Solicitud.findById(n.solicitudId);
      const conductor = await Conductor.findById(n.conductorId);
      let usuarioRegistro = await Usuario.findById(n.usuarioRegistroId);

      // Si no existe el usuario de registro específico, buscar cualquier usuario
      if (!usuarioRegistro) {
        usuarioRegistro = await Usuario.findOne({ rol: conductor ? conductor.usuario : undefined }) || (await Usuario.findOne());
      }

      if (!usuarioRegistro) {
        console.warn("⚠️ No se encontró usuario para registrar la novedad:", n.titulo);
        continue;
      }

      await Novedad.create({
        _id: new mongoose.Types.ObjectId(n._id),
        titulo: n.titulo,
        descripcion: n.descripcion,
        tipo: n.tipo,
        severidad: n.severidad,
        solicitud: solicitud ? solicitud._id : null,
        conductor: conductor ? conductor._id : null,
        usuarioRegistro: usuarioRegistro._id,
        estadoNovedad: n.estadoNovedad,
        ubicacion: n.ubicacion,
        rutaInicial: n.rutaInicial,
        rutaNueva: n.rutaNueva,
        fotosEvidencia: n.fotosEvidencia || [],
        historialNotas: n.historialNotas || [],
        notasResolucion: n.notasResolucion,
        estado: n.estado,
      });

      console.log(`✅ Novedad creada: ${n.titulo} (${n.estadoNovedad})`);
    }

    console.log("🎉 Siembra de novedades completada exitosamente.");
  } catch (error) {
    console.error("❌ Error al sembrar novedades:", error);
  }
};
