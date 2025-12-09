# Étape build : utilise Node 20 stable et léger
FROM node:20-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installer les dépendances en mode production et reproductible
RUN npm ci

# Copier le reste du code
COPY . .

# Construire l’application
RUN npm run build


# Étape run : Nginx sert uniquement les fichiers compilés
FROM nginx:alpine

# Supprimer les fichiers par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier le build dans le dossier Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# (Optionnel) Ajouter une config Nginx custom si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Lancer Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]
