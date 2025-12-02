#!/bin/bash
set -e

echo "🔨 Construction du projet Angular pour la production..."
ng build

# Détection du dossier de sortie (Angular 17+ avec application builder -> dist/projet/browser)
# On vérifie si le dossier browser existe, sinon on prend la racine du dist
BUILD_DIR="dist/elyes-immo/browser"
if [ ! -d "$BUILD_DIR" ]; then
    BUILD_DIR="dist/elyes-immo"
fi

echo "📂 Dossier de build détecté : $BUILD_DIR"

# Création automatique de firebase.json s'il n'existe pas
if [ ! -f "firebase.json" ]; then
    echo "⚙️ Création de firebase.json (Configuration Hosting)..."
    cat > firebase.json <<JSON
{
  "hosting": {
    "public": "$BUILD_DIR",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
JSON
fi

echo "🔥 Lancement du déploiement vers Firebase..."

# Vérifie si l'utilisateur est connecté à Firebase CLI
if ! firebase login:list > /dev/null 2>&1; then
    echo "⚠️ Vous n'êtes pas connecté. Veuillez vous connecter dans le navigateur :"
    firebase login
fi

firebase deploy --only hosting
