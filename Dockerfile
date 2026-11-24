# 1. Imagen oficial ligera de Node.js
FROM node:22-alpine

# 2. Activar pnpm (que ya viene integrado en Node con Corepack)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 3. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 4. Copiar manifiestos de dependencias primero
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 5. Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# 6. Copiar el código fuente del backend
COPY . .

# 7. Exponer el puerto 3000 (API REST + Socket.IO)
EXPOSE 3000

# 8. Comando de arranque (ejecuta node src/index.js)
CMD ["pnpm", "start"]