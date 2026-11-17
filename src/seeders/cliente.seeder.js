import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuario from "../modules/usuario/usuario.model.js";
import Cliente from "../modules/cliente/cliente.model.js";
import Rol from "../modules/rol/rol.model.js";
import { ROLES } from "../constants/permiso.js";

const DEFAULT_CLIENTS = [
  {
    clienteId: "6acd54c48455a65862bc2745",
    usuarioId: "6acd54c48455a65862bc2744",
    nombre: "Gloria",
    apellido: "Garcia",
    tipoDocumento: "CC",
    documento: "1013460443",
    correo: "vault.medina.m@gmail.com",
    telefono: "3101234567",
    direccion: "Calle 100 #15-20, Bogotá",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6ab14e3ff7f9f9fba394bedb",
    usuarioId: "6ab14e3ff7f9f9fba394beda",
    nombre: "Jose",
    apellido: "Lora",
    tipoDocumento: "CC",
    documento: "1032456789",
    correo: "joselora22@gmail.com",
    telefono: "3112345678",
    direccion: "Carrera 7 #45-12, Bogotá",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6ac7924ef93fb89e5a8cdf32",
    usuarioId: "6ac7924df93fb89e5a8cdf31",
    nombre: "Margoth",
    apellido: "Padilla Castro",
    tipoDocumento: "CC",
    documento: "1051822555",
    correo: "margoth.padilla@gmail.com",
    telefono: "3123456789",
    direccion: "Calle 85 #11-50, Bogotá",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6ae1181764e76ae5f08f43d1",
    usuarioId: "6ae1181764e76ae5f08f43d0",
    nombre: "Luis Miguel",
    apellido: "Orozco Perez",
    tipoDocumento: "CC",
    documento: "1051896896",
    correo: "miguel@gmail.com",
    telefono: "3134567890",
    direccion: "Calle 127 #19-40, Bogotá",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6ae218915483a1a4b7e45b75",
    usuarioId: "6ae218915483a1a4b7e45b74",
    nombre: "Magnolia",
    apellido: "Barajas",
    tipoDocumento: "CC",
    documento: "123456789",
    correo: "magnoliab@example.com",
    telefono: "3145678901",
    direccion: "Avenida Suba #115-32, Bogotá",
    foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6ae95f65610b55c0e6d74396",
    usuarioId: "6ae95f65610b55c0e6d74395",
    nombre: "Carlos",
    apellido: "Mendoza",
    tipoDocumento: "CC",
    documento: "1122334455",
    correo: "carlos.mendoza@ejemplo.com",
    telefono: "3022223344",
    direccion: "Cra 15 #30-45, Medellín",
    foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6aeb547a08b0384f9dd2303f",
    usuarioId: "6aeb547a08b0384f9dd2303e",
    nombre: "Javier",
    apellido: "Torres",
    tipoDocumento: "CC",
    documento: "5566778899",
    correo: "javier.torres@ejemplo.com",
    telefono: "3044445566",
    direccion: "Calle 50 #12-34, Barranquilla",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6af8000108b0384f9dd23001",
    usuarioId: "6af8000108b0384f9dd23002",
    nombre: "Isabella",
    apellido: "Santos",
    tipoDocumento: "CC",
    documento: "1023456789",
    correo: "isantos.dev@icloud.com",
    telefono: "3011112222",
    direccion: "Calle 80 #45-20, Bogotá",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6af8000108b0384f9dd23003",
    usuarioId: "6af8000108b0384f9dd23004",
    nombre: "Lucía",
    apellido: "Ramírez",
    tipoDocumento: "CC",
    documento: "9988776655",
    correo: "lucia.ramirez@ejemplo.com",
    telefono: "3033334455",
    direccion: "Av. Siempre Viva #742, Cali",
    foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
  {
    clienteId: "6af8000108b0384f9dd23005",
    usuarioId: "6af8000108b0384f9dd23006",
    nombre: "Alejandro",
    apellido: "Moreno",
    tipoDocumento: "CC",
    documento: "901234567",
    correo: "alex.moreno@gmail.com",
    telefono: "3000000000",
    direccion: "Av. Principal #123, Ciudad",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    estado: true,
  },
];

export const seedClientes = async () => {
  try {
    const totalClientes = await Cliente.countDocuments();
    if (totalClientes >= 10) {
      console.log(`ℹ Ya existen ${totalClientes} clientes en la base de datos.`);
      return;
    }

    let rolCliente = await Rol.findOne({ nombre: ROLES.CLIENTE });
    if (!rolCliente) {
      rolCliente = await Rol.findOne({ nombre: "CLIENTE" });
    }
    if (!rolCliente) {
      console.error("❌ Rol CLIENTE no encontrado para sembrar clientes.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);

    for (const c of DEFAULT_CLIENTS) {
      const clienteExiste = await Cliente.findById(c.clienteId);
      if (clienteExiste) continue;

      let usuario = await Usuario.findOne({ correo: c.correo });
      if (!usuario) {
        // Si el usuarioId específico ya está tomado por otro correo, generamos uno nuevo o usamos el existente
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
          password: hashedPassword,
          foto: c.foto,
          rol: rolCliente._id,
          estado: c.estado,
        });
      } else {
        // Asegurar que el usuario tenga su foto
        if (!usuario.foto && c.foto) {
          usuario.foto = c.foto;
          await usuario.save();
        }
      }

      await Cliente.create({
        _id: new mongoose.Types.ObjectId(c.clienteId),
        usuario: usuario._id,
        direccion: c.direccion,
        foto: c.foto,
        estado: c.estado,
      });

      console.log(`✅ Cliente creado: ${c.nombre} ${c.apellido} (${c.correo})`);
    }

    console.log("🎉 Siembra de clientes completada exitosamente.");
  } catch (error) {
    console.error("❌ Error al sembrar clientes:", error);
  }
};
