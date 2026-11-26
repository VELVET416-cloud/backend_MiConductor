export const ROLES = {
    SUPERADMIN: "SUPERADMINISTRADOR",
    ADMIN: "ADMINISTRADOR",
    CONDUCTOR: "CONDUCTOR",
    CLIENTE: "CLIENTE"
};

export const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];

export const isSuperAdminRoleName = (rolName) =>
    String(rolName || "").trim().toUpperCase() === ROLES.SUPERADMIN;

export const isAdminOrSuperAdminRoleName = (rolName) => {
    const normalized = String(rolName || "").trim().toUpperCase();
    return normalized === ROLES.SUPERADMIN || normalized === ROLES.ADMIN || normalized === "ADMIN";
};

export const ACCIONES = {
    CREAR: "crear",
    VER: "ver",
    EDITAR: "editar",
    ELIMINAR: "eliminar",
    ASIGNAR: "asignar",
    RUTA: "ruta",
    CANCELAR: "cancelar"
};

export const MODULOS = {
    ROLES: "roles",
    PERMISOS: "permisos",
    USUARIOS: "usuarios",
    CONDUCTORES: "conductores",
    NOVEDADES: "novedades",
    VEHICULOS: "vehiculos",
    CLIENTES: "clientes",
    SOLICITUDES: "solicitudes"
};