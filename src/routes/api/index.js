import { Router } from "express";

import rolRoutes from "../../modules/rol/rol.routes.js";
import permisoRoutes from "../../modules/permiso/permiso.routes.js";
import usuarioRoutes from "../../modules/usuario/usuario.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Mi Conductor funcionando correctamente 🚗"
    });
});

router.use("/roles", rolRoutes);
router.use("/permisos", permisoRoutes);
router.use("/usuarios", usuarioRoutes);

export default router;