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
            required: false,
            default: null,
            trim: true
        },

        color: {
            type: String,
            required: [true, "El color es obligatorio."],
            trim: true
        },

        anio: {
            type: Number,
            required: [true, "El año es obligatorio."]
        },

        tipoVehiculo: {
            type: String,
            required: [true, "El tipo de vehículo es obligatorio."],
            trim: true
        },

        numeroPuertas: {
            type: Number,
            required: false,
            default: 4
        },

        tipoCombustible: {
            type: String,
            required: false,
            default: "Gasolina",
            trim: true
        },

        estadoSeguro: {
            type: String,
            required: false,
            default: "Activo",
            trim: true
        },

        companiaAseguradora: {
            type: String,
            required: false,
            default: "N/A",
            trim: true
        },

        fechaRevisionTecnicoMecanica: {
            type: Date,
            default: null
        },

        fechaVencimientoSoat: {
            type: Date,
            default: null
        },

        fechaVencimientoTecnomecanica: {
            type: Date,
            default: null
        },

        tarjetaPropiedad: {
            type: String,
            default: null
        },

        fotos: {
            type: [String],
            default: []
        },

        foto1: {
            type: String,
            default: null
        },

        foto2: {
            type: String,
            default: null
        },

        foto3: {
            type: String,
            default: null
        },

        gpsRastreo: {
            type: Boolean,
            default: false
        },

        airbags: {
            type: Boolean,
            default: false
        },

        frenosAbs: {
            type: Boolean,
            default: false
        },

        camaraTrasera: {
            type: Boolean,
            default: false
        },

        camaraInterior: {
            type: Boolean,
            default: false
        },

        tarjetaCirculacion: {
            type: String,
            default: null
        },

        seguro: {
            type: String,
            default: null
        },

        verificacion: {
            type: String,
            default: null
        },

        certificadoTecnicoMecanica: {
            type: String,
            default: null
        },

        certificadoSoat: {
            type: String,
            default: null
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