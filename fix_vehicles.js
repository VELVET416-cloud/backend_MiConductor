import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import Vehiculo from "./src/modules/vehiculo/vehiculo.model.js";
import Cliente from "./src/modules/cliente/cliente.model.js";

const run = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Connected to DB.");

        // Find all vehicles
        const vehiculos = await Vehiculo.find({});
        console.log(`Found ${vehiculos.length} vehicles.`);

        for (const v of vehiculos) {
            const clienteIdStr = v.cliente.toString();
            
            // Check if this ID belongs to a Cliente document
            const isCliente = await Cliente.findById(clienteIdStr);
            if (!isCliente) {
                // If not, it might be a usuario ID. Let's find the Cliente by usuario ID.
                const clienteByUsuario = await Cliente.findOne({ usuario: clienteIdStr });
                if (clienteByUsuario) {
                    v.cliente = clienteByUsuario._id;
                    await v.save();
                    console.log(`Fixed vehicle ${v._id}: Changed cliente from ${clienteIdStr} to ${clienteByUsuario._id}`);
                } else {
                    console.log(`Warning: Vehicle ${v._id} has unresolvable cliente ${clienteIdStr}`);
                }
            } else {
                console.log(`Vehicle ${v._id} is already fine.`);
            }
        }

        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
