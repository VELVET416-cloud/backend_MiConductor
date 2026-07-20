import Vehiculo from "./vehiculo.model.js";

class VehiculoRepository {

    async crear(datos) {
        return await Vehiculo.create(datos);
    }

    async obtenerTodos() {
        return await Vehiculo.find()
            .populate("conductor");
    }

    async obtenerPorId(id) {
        return await Vehiculo.findById(id)
            .populate("conductor");
    }

    async obtenerPorPlaca(placa) {
        return await Vehiculo.findOne({ placa })
            .populate("conductor");
    }

    async obtenerPorConductor(conductorId) {
        return await Vehiculo.find({ conductor: conductorId })
            .populate("conductor");
    }

    async actualizar(id, datos) {
        return await Vehiculo.findByIdAndUpdate(
            id,
            datos,
            {
                new: true,
                runValidators: true
            }
        ).populate("conductor");
    }

    async eliminar(id) {
        return await Vehiculo.findByIdAndDelete(id);
    }

}

export default new VehiculoRepository();
