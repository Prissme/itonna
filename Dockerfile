# Utilisation d'une image Node.js légère et stable
FROM node:20-slim

# Création du répertoire de travail
WORKDIR /app

# Copie uniquement du package.json pour installer les dépendances
COPY package.json ./

# Installation des dépendances (génère un lockfile propre en interne)
RUN npm install

# Copie du reste des fichiers (le code du bot)
COPY . .

# Commande de lancement
CMD ["node", "bot.js"]
