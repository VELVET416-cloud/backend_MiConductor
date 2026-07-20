import Novedad from "./novedad.model.js";

class NovedadRepository {

    async crear(datos) {
        return await Novedad.create(datos);
    }

    async obtenerTodos() {
        return await Novedad.find()
            .populate("servicio")
            .populate("conductor")
            .populate("cliente");
    }

    async obtenerPorId(id) {
        return await Novedad.findById(id)
            .populate("servicio")
            .populate("conductor")
            .populate("cliente");
    }

    async obtenerPorServicio(servicioId) {
        return await Novedad.find({ servicio: servicioId })
            .populate("servicio")
            .populate("conductor")
            .populate("cliente");
    }

    async obtenerPorConductor(conductorId) {
        return await Novedad.find({ conductor: conductorId })
            .populate("servicio")
            .populate("conductor")
            .populate("cliente");
    }

    async actualizar(id, datos) {
        return await Novedad.findByIdAndUpdate(
            id,
            datos,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("servicio")
            .populate("conductor")
            .populate("cliente");
    }

    async eliminar(id) {
        return await Novedad.findByIdAndDelete(id);
    }

}

export default new NovedadRepository();
