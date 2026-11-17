import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuario from "../modules/usuario/usuario.model.js";
import Conductor from "../modules/conductor/conductor.model.js";
import Rol from "../modules/rol/rol.model.js";
import { ROLES } from "../constants/permiso.js";

const DEFAULT_CONDUCTORES = [
  {
    conductorId: "6ab65ce8a289bce4956cbad8",
    usuarioId: "6ab65ce8a289bce4956cbad7",
    nombre: "Carlos Alberto",
    apellido: "Ruiz Peña",
    tipoDocumento: "CC",
    documento: "1015677644",
    correo: "carlos.ruiz@miconductor.com",
    telefono: "3118904567",
    direccion: "Cra 15 #85-12, Bogotá",
    fechaNacimiento: new Date("1988-04-12"),
    edad: 36,
    licencia: "LIC-C1-1015677644",
    categoriaLicencia: "C1",
    fechaExpedicion: new Date("2020-01-15"),
    fechaVencimiento: new Date("2030-01-15"),
    experiencia: 8,
    disponible: true,
    estado: true,
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    licencias: [
      {
        numero: "LIC-C1-1015677644",
        categoria: "C1",
        fechaExpedicion: new Date("2020-01-15"),
        fechaVencimiento: new Date("2030-01-15"),
        lugarExpedicion: "Bogotá D.C.",
      },
    ],
  },
  {
    conductorId: "6ab1cf25f0a4eff62e86c6f3",
    usuarioId: "6ab1cf25f0a4eff62e86c6f2",
    nombre: "Andrés Felipe",
    apellido: "Gómez Montoya",
    tipoDocumento: "CC",
    documento: "1020456789",
    correo: "andres.gomez@miconductor.com",
    telefono: "3156789012",
    direccion: "Calle 116 #9-45, Bogotá",
    fechaNacimiento: new Date("1992-08-20"),
    edad: 32,
    licencia: "LIC-C2-1020456789",
    categoriaLicencia: "C2",
    fechaExpedicion: new Date("2019-06-10"),
    fechaVencimiento: new Date("2029-06-10"),
    experiencia: 6,
    disponible: true,
    estado: true,
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    licencias: [
      {
        numero: "LIC-C2-1020456789",
        categoria: "C2",
        fechaExpedicion: new Date("2019-06-10"),
        fechaVencimiento: new Date("2029-06-10"),
        lugarExpedicion: "Medellín",
      },
    ],
  },
  {
    conductorId: "6b01000108b0384f9dd23010",
    usuarioId: "6b01000108b0384f9dd23009",
    nombre: "Diego Fernando",
    apellido: "Martínez Silva",
    tipoDocumento: "CC",
    documento: "1032546781",
    correo: "diego.martinez@miconductor.com",
    telefono: "3189012345",
    direccion: "Calle 63 #24-18, Bogotá",
    fechaNacimiento: new Date("1990-11-05"),
    edad: 34,
    licencia: "LIC-B2-1032546781",
    categoriaLicencia: "B2",
    fechaExpedicion: new Date("2018-03-22"),
    fechaVencimiento: new Date("2028-03-22"),
    experiencia: 10,
    disponible: false,
    estado: true,
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    licencias: [
      {
        numero: "LIC-B2-1032546781",
        categoria: "B2",
        fechaExpedicion: new Date("2018-03-22"),
        fechaVencimiento: new Date("2028-03-22"),
        lugarExpedicion: "Bogotá D.C.",
      },
    ],
  },
  {
    conductorId: "6b01000108b0384f9dd23012",
    usuarioId: "6b01000108b0384f9dd23011",
    nombre: "Mateo",
    apellido: "Castro Restrepo",
    tipoDocumento: "CC",
    documento: "1045678901",
    correo: "mateo.castro@miconductor.com",
    telefono: "3007654321",
    direccion: "Carrera 43A #1-50, Medellín",
    fechaNacimiento: new Date("1995-02-17"),
    edad: 29,
    licencia: "LIC-C1-1045678901",
    categoriaLicencia: "C1",
    fechaExpedicion: new Date("2017-09-14"),
    fechaVencimiento: new Date("2023-09-14"), // Licencia vencida para validación
    experiencia: 5,
    disponible: false,
    estado: true,
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    licencias: [
      {
        numero: "LIC-C1-1045678901",
        categoria: "C1",
        fechaExpedicion: new Date("2017-09-14"),
        fechaVencimiento: new Date("2023-09-14"),
        lugarExpedicion: "Medellín",
      },
    ],
  },
  {
    conductorId: "6b01000108b0384f9dd23014",
    usuarioId: "6b01000108b0384f9dd23013",
    nombre: "Valentina",
    apellido: "Herrera Morales",
    tipoDocumento: "CC",
    documento: "1098765432",
    correo: "valentina.herrera@miconductor.com",
    telefono: "3201234567",
    direccion: "Calle 140 #11-20, Bogotá",
    fechaNacimiento: new Date("1996-07-25"),
    edad: 28,
    licencia: "LIC-C1-1098765432",
    categoriaLicencia: "C1",
    fechaExpedicion: new Date("2021-04-10"),
    fechaVencimiento: new Date("2031-04-10"),
    experiencia: 4,
    disponible: true,
    estado: true,
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    licencias: [
      {
        numero: "LIC-C1-1098765432",
        categoria: "C1",
        fechaExpedicion: new Date("2021-04-10"),
        fechaVencimiento: new Date("2031-04-10"),
        lugarExpedicion: "Cali",
      },
    ],
  },
];

export const seedConductores = async () => {
  try {
    const totalConductores = await Conductor.countDocuments();
    if (totalConductores >= 5) {
      console.log(`ℹ Ya existen ${totalConductores} conductores en la base de datos.`);
      return;
    }

    let rolConductor = await Rol.findOne({ nombre: ROLES.CONDUCTOR });
    if (!rolConductor) {
      rolConductor = await Rol.findOne({ nombre: "CONDUCTOR" });
    }
    if (!rolConductor) {
      console.error("❌ Rol CONDUCTOR no encontrado para sembrar conductores.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);

    for (const c of DEFAULT_CONDUCTORES) {
      const conductorExiste = await Conductor.findById(c.conductorId);
      if (conductorExiste) continue;

      let usuario = await Usuario.findOne({ correo: c.correo });
      if (!usuario) {
        const userWithId = await Usuario.findById(c.usuarioId);
        const finalUserId = userWithId ? new mongoose.Types.ObjectId() : new mongoose.Types.ObjectId(c.usuarioId);

        usuario = await Usuario.create({
          _id: finalUserId,
          nombre: c.nombre,
          apellido: c.apellido,
          tipoDocumento: c.tipoDocumento,
          documento: c.documento,
          correo: c.correo,
          telefono: c.telefono,
          direccion: c.direccion,
          fechaNacimiento: c.fechaNacimiento,
          edad: c.edad,
          password: hashedPassword,
          foto: c.foto,
          rol: rolConductor._id,
          estado: c.estado,
        });
      }

      await Conductor.create({
        _id: new mongoose.Types.ObjectId(c.conductorId),
        usuario: usuario._id,
        licencia: c.licencia,
        categoriaLicencia: c.categoriaLicencia,
        fechaExpedicion: c.fechaExpedicion,
        fechaVencimiento: c.fechaVencimiento,
        experiencia: c.experiencia,
        disponible: c.disponible,
        licencias: c.licencias,
        estado: c.estado,
      });

      console.log(`✅ Conductor creado: ${c.nombre} ${c.apellido} (${c.correo})`);
    }

    console.log("🎉 Siembra de conductores completada exitosamente.");
  } catch (error) {
    console.error("❌ Error al sembrar conductores:", error);
  }
};
