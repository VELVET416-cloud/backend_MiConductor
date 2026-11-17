import mongoose from "mongoose";
import Solicitud from "../modules/solicitud/solicitud.model.js";
import Cliente from "../modules/cliente/cliente.model.js";
import Vehiculo from "../modules/vehiculo/vehiculo.model.js";
import Conductor from "../modules/conductor/conductor.model.js";

const DEFAULT_SOLICITUDES = [
  {
    _id: "6ad0de5b7e6195ad5a59ab32",
    codigo: "SOL-20261015-001",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6aa2bea1f57fff3dc47d0948", // QPS125
    conductorAsignado: "6ab65ce8a289bce4956cbad8", // Carlos Alberto Ruiz
    tipoServicio: "Conductor Elegido",
    descripcion: "Servicio de conductor elegido zona norte de Bogotá hasta Chía",
    origen: "Parque de la 93, Bogotá",
    destino: "Centro Chía, Chía, Cundinamarca",
    prioridad: "MEDIA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-10-15T14:00:00.000Z"),
  },
  {
    _id: "6ad236cc60f2c7f53b94811b",
    codigo: "SOL-20261016-002",
    cliente: "6ab14e3ff7f9f9fba394bedb", // Jose Lora
    correoCliente: "joselora22@gmail.com",
    vehiculo: "6ab663d1f15c0c2feb1056d6", // CEC356
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Traslado corporativo aeropuerto El Dorado",
    origen: "Calle 72 #7-30, Bogotá",
    destino: "Aeropuerto El Dorado T1, Bogotá",
    prioridad: "ALTA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-10-16T09:30:00.000Z"),
  },
  {
    _id: "6ad269eb2d49968b4a9d5061",
    codigo: "SOL-20261016-003",
    cliente: "6ac7924ef93fb89e5a8cdf32", // Margoth Padilla
    correoCliente: "margoth.padilla@gmail.com",
    vehiculo: "6ac46c46074c17d84193dfe0", // GDD345
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor por Horas",
    descripcion: "Acompañamiento diligencias bancarias centro internacional",
    origen: "Calle 85 #11-50, Bogotá",
    destino: "Carrera 7 #32-16, Bogotá",
    prioridad: "BAJA",
    estado: "CANCELADO",
    fechaProgramada: new Date("2026-10-16T15:00:00.000Z"),
  },
  {
    _id: "6ad7d2871edab77510e9cb25",
    codigo: "SOL-20261020-004",
    cliente: "6ae1181764e76ae5f08f43d1", // Luis Miguel Orozco
    correoCliente: "miguel@gmail.com",
    vehiculo: "6ae1240764e76ae5f08f43d2", // QPS126
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Recorrido nocturno evento empresarial",
    origen: "Calle 127 #19-40, Bogotá",
    destino: "Hotel Tequendama, Bogotá",
    prioridad: "MEDIA",
    estado: "CANCELADO",
    fechaProgramada: new Date("2026-10-20T19:00:00.000Z"),
  },
  {
    _id: "6adfe347f90f620f260e0acb",
    codigo: "SOL-20261026-005",
    cliente: "6ae218915483a1a4b7e45b75", // Magnolia Barajas
    correoCliente: "magnoliab@example.com",
    vehiculo: "6ae21e29a0e3e92d46814ca8", // AND123
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor Elegido",
    descripcion: "Servicio de recogida en restaurante Usaquén",
    origen: "Usaquén Plaza, Bogotá",
    destino: "Colina Campestre, Bogotá",
    prioridad: "ALTA",
    estado: "CANCELADO",
    fechaProgramada: new Date("2026-10-26T22:30:00.000Z"),
  },
  {
    _id: "6ae096a8803b784a67a55f5b",
    codigo: "SOL-20261027-006",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6acd570cf631d363a7709bcd", // SBD526
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Viaje ida y vuelta reunión ejecutiva Cajicá",
    origen: "Calle 100 #15-20, Bogotá",
    destino: "Parque Principal, Cajicá",
    prioridad: "MEDIA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-10-27T08:00:00.000Z"),
  },
  {
    _id: "6ae10ece64e76ae5f08f43c5",
    codigo: "SOL-20261027-007",
    cliente: "6ae95f65610b55c0e6d74396", // Carlos Mendoza
    correoCliente: "carlos.mendoza@ejemplo.com",
    vehiculo: "6ae97687dea78e1cb72f720d", // ABC562
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor por Horas",
    descripcion: "Servicio express para traslado médico",
    origen: "Cra 15 #30-45, Bogotá",
    destino: "Clínica del Country, Bogotá",
    prioridad: "URGENTE",
    estado: "CANCELADO",
    fechaProgramada: new Date("2026-10-27T11:00:00.000Z"),
  },
  {
    _id: "6ae1240964e76ae5f08f43d3",
    codigo: "SOL-20261027-008",
    cliente: "6aeb547a08b0384f9dd2303f", // Javier Torres
    correoCliente: "javier.torres@ejemplo.com",
    vehiculo: "6aeb547b08b0384f9dd23040", // ABC234
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor Elegido",
    descripcion: "Retorno seguro cena de fin de semana",
    origen: "Zona T, Bogotá",
    destino: "Cedritos, Bogotá",
    prioridad: "MEDIA",
    estado: "CANCELADO",
    fechaProgramada: new Date("2026-10-27T23:00:00.000Z"),
  },
  {
    _id: "6ae1e64c63b6221f0e60e150",
    codigo: "SOL-20261028-009",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6aa2bea1f57fff3dc47d0948", // QPS125
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Traslado corporativo a sede empresarial Salitre",
    origen: "Chicó Norte, Bogotá",
    destino: "Ciudad Salitre, Bogotá",
    prioridad: "ALTA",
    estado: "EN_PROCESO",
    fechaProgramada: new Date("2026-10-28T07:30:00.000Z"),
  },
  {
    _id: "6ae1e81b63b6221f0e60e157",
    codigo: "SOL-20261028-010",
    cliente: "6ac7924ef93fb89e5a8cdf32", // Margoth Padilla
    correoCliente: "margoth.padilla@gmail.com",
    vehiculo: "6ac7b770f93fb89e5a8cdf45", // ACF456
    conductorAsignado: "6ab1cf25f0a4eff62e86c6f3", // Andrés Felipe Gómez
    tipoServicio: "Conductor Elegido",
    descripcion: "Servicio de recogida aeropuerto llegada vuelo internacional",
    origen: "Aeropuerto El Dorado, Bogotá",
    destino: "Rosales, Bogotá",
    prioridad: "ALTA",
    estado: "EN_PROCESO",
    fechaProgramada: new Date("2026-10-28T08:15:00.000Z"),
  },
  {
    _id: "6ae2158c5483a1a4b7e45b71",
    codigo: "SOL-20261028-011",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6ae900b8d240890aedc919a9", // ADF123
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor por Horas",
    descripcion: "Diligencias personales en centros comerciales del norte",
    origen: "Unicentro Bogotá",
    destino: "Santa Fe Mall, Bogotá",
    prioridad: "BAJA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-10-28T10:00:00.000Z"),
  },
  {
    _id: "6ae21ef4a0e3e92d46814cac",
    codigo: "SOL-20261028-012",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6aa2bea1f57fff3dc47d0948", // QPS125
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Traslado a reunión de negocios Calle 100",
    origen: "Santa Ana Oriental, Bogotá",
    destino: "Calle 100 #7-33, Bogotá",
    prioridad: "MEDIA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-10-28T12:00:00.000Z"),
  },
  {
    _id: "6ae9e858602064bcbd730d73",
    codigo: "SOL-20261103-013",
    cliente: "6ab14e3ff7f9f9fba394bedb", // Jose Lora
    correoCliente: "joselora22@gmail.com",
    vehiculo: "6ab663d1f15c0c2feb1056d6", // CEC356
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor Elegido",
    descripcion: "Servicio evento social noche de viernes",
    origen: "Club El Nogal, Bogotá",
    destino: "Multiparque Autopista Norte, Bogotá",
    prioridad: "ALTA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-11-03T20:00:00.000Z"),
  },
  {
    _id: "6aeb3d35482ea061e474d603",
    codigo: "SOL-20261104-014",
    cliente: "6ac7924ef93fb89e5a8cdf32", // Margoth Padilla
    correoCliente: "margoth.padilla@gmail.com",
    vehiculo: "6ac46c46074c17d84193dfe0", // GDD345
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Visita a clientes industriales puente Aranda",
    origen: "Calle 85 #11-50, Bogotá",
    destino: "Zona Industrial Puente Aranda, Bogotá",
    prioridad: "MEDIA",
    estado: "COMPLETADO",
    fechaProgramada: new Date("2026-11-04T09:00:00.000Z"),
  },
  {
    _id: "6aeb500db9eb3278af7ef395",
    codigo: "SOL-20261104-015",
    cliente: "6ae1181764e76ae5f08f43d1", // Luis Miguel Orozco
    correoCliente: "miguel@gmail.com",
    vehiculo: "6ae1240764e76ae5f08f43d2", // QPS126
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor Elegido",
    descripcion: "Servicio en curso de retorno seguro hacia la calera",
    origen: "Zona Rosa Calle 82, Bogotá",
    destino: "Mirador de La Calera, Cundinamarca",
    prioridad: "URGENTE",
    estado: "EN_PROCESO",
    fechaProgramada: new Date("2026-11-04T13:00:00.000Z"),
  },
  {
    _id: "6aeb547b08b0384f9dd23041",
    codigo: "SOL-20261104-016",
    cliente: "6aeb547a08b0384f9dd2303f", // Javier Torres
    correoCliente: "javier.torres@ejemplo.com",
    vehiculo: "6aeb547b08b0384f9dd23040", // ABC234
    conductorAsignado: "6ab65ce8a289bce4956cbad8",
    tipoServicio: "Conductor por Horas",
    descripcion: "Servicio activo por horas en el sector financiero",
    origen: "Calle 72 #10-03, Bogotá",
    destino: "Carrera 15 #93-60, Bogotá",
    prioridad: "MEDIA",
    estado: "EN_PROCESO",
    fechaProgramada: new Date("2026-11-04T14:30:00.000Z"),
  },
  {
    _id: "6af9000108b0384f9dd23020",
    codigo: "SOL-20261117-017",
    cliente: "6acd54c48455a65862bc2745", // Gloria Garcia
    correoCliente: "vault.medina.m@gmail.com",
    vehiculo: "6aa2bea1f57fff3dc47d0948", // QPS125
    conductorAsignado: null,
    tipoServicio: "Conductor Elegido",
    descripcion: "Solicitud pendiente para recogida en Zona G Bogotá",
    origen: "Carrera 5 #69-26, Zona G, Bogotá",
    destino: "Calle 116 #15-30, Bogotá",
    prioridad: "ALTA",
    estado: "PENDIENTE",
    fechaProgramada: new Date("2026-11-17T18:00:00.000Z"),
  },
  {
    _id: "6af9000108b0384f9dd23021",
    codigo: "SOL-20261117-018",
    cliente: "6ab14e3ff7f9f9fba394bedb", // Jose Lora
    correoCliente: "joselora22@gmail.com",
    vehiculo: "6ab663d1f15c0c2feb1056d6", // CEC356
    conductorAsignado: null,
    tipoServicio: "Transporte Ejecutivo",
    descripcion: "Solicitud de transporte empresarial aeropuerto mañana temprano",
    origen: "Calle 100 #8A-55, World Trade Center, Bogotá",
    destino: "Aeropuerto El Dorado Terminal 2, Bogotá",
    prioridad: "MEDIA",
    estado: "PENDIENTE",
    fechaProgramada: new Date("2026-11-18T06:00:00.000Z"),
  },
];

export const seedSolicitudes = async () => {
  try {
    const totalSolicitudes = await Solicitud.countDocuments();
    if (totalSolicitudes >= 15) {
      console.log(`ℹ Ya existen ${totalSolicitudes} solicitudes en la base de datos.`);
      return;
    }

    for (const s of DEFAULT_SOLICITUDES) {
      const existe = await Solicitud.findOne({
        $or: [{ _id: new mongoose.Types.ObjectId(s._id) }, { codigo: s.codigo }]
      });
      if (existe) continue;

      // Verificar que el cliente existe
      const cliente = await Cliente.findById(s.cliente);
      const clienteId = cliente ? cliente._id : null;

      // Verificar que el vehículo existe
      const vehiculo = s.vehiculo ? await Vehiculo.findById(s.vehiculo) : null;
      const vehiculoId = vehiculo ? vehiculo._id : null;

      // Verificar que el conductor existe (si está asignado)
      let conductorId = null;
      if (s.conductorAsignado) {
        const cond = await Conductor.findById(s.conductorAsignado);
        if (cond) conductorId = cond._id;
      }

      try {
        await Solicitud.create({
          _id: new mongoose.Types.ObjectId(s._id),
          codigo: s.codigo,
          cliente: clienteId,
          correoCliente: s.correoCliente,
          vehiculo: vehiculoId,
          conductorAsignado: conductorId,
          tipoServicio: s.tipoServicio,
          descripcion: s.descripcion,
          origen: s.origen,
          destino: s.destino,
          prioridad: s.prioridad,
          estado: s.estado,
          fechaProgramada: s.fechaProgramada,
        });

        console.log(`✅ Solicitud creada: ${s.codigo} (${s.estado})`);
      } catch (err) {
        if (err.code === 11000) {
          // Ya existe duplicado, ignorar
          continue;
        }
        console.error(`❌ Error creando solicitud ${s.codigo}:`, err.message);
      }
    }

    console.log("🎉 Siembra de solicitudes completada exitosamente.");
  } catch (error) {
    console.error("❌ Error al sembrar solicitudes:", error);
  }
};
