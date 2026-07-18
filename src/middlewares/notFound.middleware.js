const notFound = (req, res) => {

    return res.status(404).json({

        success:false,

        message:"Ruta no encontrada"

    });

};

export default notFound;