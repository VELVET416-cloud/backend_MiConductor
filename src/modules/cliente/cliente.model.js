import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: [true, "El usuario es obligatorio."],
            unique: true
        },

        direccion: {
            type: String,
            required: [true, "La dirección es obligatoria."],
            trim: true
        },

        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

clienteSchema.virtual("vehiculos", {
    ref: "Vehiculo",
    localField: "_id",
    foreignField: "cliente"
});

const Cliente = mongoose.model("Cliente", clienteSchema);

export default Cliente;