import mongoose from "mongoose";

const vehiculoSchema = new mongoose.Schema(
    {
        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            required: [true, "El cliente es obligatorio."]
        },

        marca: {
            type: String,
            required: [true, "La marca es obligatoria."],
            trim: true
        },

        modelo: {
            type: String,
            required: [true, "El modelo es obligatorio."],
            trim: true
        },

        placa: {
            type: String,
            required: [true, "La placa es obligatoria."],
            uppercase: true,
            unique: true,
            trim: true
        },

        numeroChasis: {
            type: String,
            required: [true, "El número de chasis es obligatorio."],
            unique: true,
            trim: true
        },

        color: {
            type: String,
            required: [true, "El color es obligatorio."],
            trim: true
        },

        foto: {
            type: String,
            default: null
        },

        estado: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);

export default Vehiculo;