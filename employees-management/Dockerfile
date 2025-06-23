# Partimos de Node Alpine para que sea ligera
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para mejor cache de Docker)
COPY package.json yarn.lock ./

# Instalamos las dependencias incluyendo devDependencies (necesario para desarrollo)
RUN yarn install --frozen-lockfile

# Instalamos el CLI de NestJS globalmente
RUN yarn global add @nestjs/cli

# Verificamos que nest esté disponible
RUN nest --version

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de la app y el de debug
EXPOSE 3001 9229

# Variables de entorno para desarrollo
ENV NODE_ENV=development

# El comando por defecto ejecuta Nest en modo desarrollo
CMD ["yarn", "dev"]