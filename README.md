# 🚖 Backend Mi Conductor

Este es el backend del proyecto **Mi Conductor**. Aquí se encuentra toda la lógica del sistema, la conexión con la base de datos y las API que consumirá la aplicación.

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Socket.IO
- JWT
- bcrypt
- dotenv
- PNPM

---

# Antes de empezar

Es necesario tener instalado:

- Node.js
- Git
- PNPM

Para verificar que todo está instalado correctamente:

```bash
node -v
pnpm -v
git --version
```

---

# Descargar el proyecto

```bash
git clone https://github.com/VELVET416-cloud/backend_MiConductor.git
```

Entrar a la carpeta:

```bash
cd backend_MiConductor
```

---

# Instalar dependencias

Cada vez que alguien descargue el proyecto por primera vez debe ejecutar:

```bash

primero instalen el pnpm 

luego ponen este comando pnpm install.

Esto instalará todas las librerías necesarias.

---

# Configurar el archivo .env

Crear un archivo llamado `.env` en la raíz del proyecto y agregar las variables correspondientes.

Ejemplo:

PORT=3000

CLIENT_URL=http://localhost:5173

JWT_SECRET=miconductor123

MONGO_URI=mongodb+srv://mi_conductor:Mi_conductor2026@miconductor.u0fbedm.mongodb.net/?appName=MiConductor
```

---

# Ejecutar el proyecto

Modo desarrollo:

```bash
pnpm dev
```

Si todo está bien configurado, el servidor iniciará correctamente.

---

# Estructura del proyecto

```
src
│
├── config
├── middlewares
├── modules
├── routes
├── sockets
├── utils
├── app.js
└── index.js
```

---

# Trabajar con Git

Antes de comenzar a programar:

```bash
git pull origin main
```

Crear una nueva rama:

```bash
git checkout -b feature/nombre-de-la-rama
```

Guardar cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin feature/nombre-de-la-rama
```

---

# Si agregas nuevas dependencias

Cuando necesites instalar una librería:

```bash
pnpm add nombre-paquete
```

Si es una dependencia de desarrollo:

```bash
pnpm add -D nombre-paquete
```

Después de hacer cambios en las dependencias recuerda subir también el archivo `pnpm-lock.yaml`.

---

# Notas

- No subir la carpeta `node_modules`.
- No subir el archivo `.env`.
- Mantener actualizado el repositorio antes de empezar a trabajar.
- Si aparece algún error relacionado con dependencias, ejecutar nuevamente:

```bash
pnpm install
```


