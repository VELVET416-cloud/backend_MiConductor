import mongoose from "mongoose";

const permisoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre del permiso es obligatorio"],
            trim: true,
            maxlength: 100
        },

        codigo: {
            type: String,
            required: [true, "El código del permiso es obligatorio"],
            unique: true,
            trim: true,
            lowercase: true
        },

        modulo: {
            type: String,
            required: [true, "El módulo es obligatorio"],
            trim: true,
            maxlength: 100
        },

        descripcion: {
            type: String,
            required: [true, "La descripción es obligatoria"],
            trim: true,
            maxlength: 250
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Permiso = mongoose.model("Permiso", permisoSchema);

export default Permiso;