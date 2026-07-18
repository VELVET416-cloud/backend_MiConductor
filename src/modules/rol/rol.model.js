import mongoose from "mongoose";

const rolSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre del rol es obligatorio"],
            unique: true,
            trim: true
        },

        descripcion: {
            type: String,
            required: [true, "La descripción es obligatoria"],
            trim: true,
            maxlength: 250
        },

        permisos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permiso"
            }
        ],

        // Indica si el rol pertenece al sistema
        esSistema: {
            type: Boolean,
            default: false
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

const Rol = mongoose.model("Rol", rolSchema);

export default Rol;