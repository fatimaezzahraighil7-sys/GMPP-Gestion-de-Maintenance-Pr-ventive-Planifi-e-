# ----------- Étape 1 : Build de l'application -----------

# Utilise une image légère de Node.js (version 18 alpine)
FROM node:18-alpine AS build

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie uniquement les fichiers de dépendances (optimisation du cache Docker)
COPY package*.json ./

# Installe les dépendances du projet (node_modules)
RUN npm install

# Copie tout le reste du projet dans le conteneur
COPY . .

# Build de l'application (ex: React, Vue → dossier dist)
RUN npm run build


# ----------- Étape 2 : Serveur web avec Nginx -----------

# Utilise une image Nginx légère
FROM nginx:alpine

# Copie les fichiers buildés (dist) vers le dossier web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copie la configuration personnalisée de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80 (HTTP)
EXPOSE 80

# Lance Nginx en mode premier plan (obligatoire pour Docker)
CMD ["nginx", "-g", "daemon off;"]