#!/bin/bash

# Arrêter le script si une erreur survient
set -e

echo "🚀 Configuration du projet ElyesImmo..."

PROJECT_NAME="elyes-immo"

# 1. Vérification / Création du projet
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️ Le dossier '$PROJECT_NAME' existe déjà."
    echo "🔄 Passage en mode RÉPARATION/MISE À JOUR..."
    cd "$PROJECT_NAME"
else
    # Vérif CLI
    if ! command -v ng &> /dev/null; then
        echo "Angular CLI n'est pas installé. Installation..."
        npm install -g @angular/cli
    fi
    
    echo "📦 Création du projet Angular '$PROJECT_NAME'..."
    ng new "$PROJECT_NAME" --routing --style=css --skip-git --defaults
    cd "$PROJECT_NAME"
fi

# 2. Installation des dépendances (Force la réinstallation pour corriger les versions)
echo "🎨 Installation de Tailwind CSS et de l'adaptateur PostCSS..."
# L'installation de @tailwindcss/postcss est la clé pour corriger ton erreur
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer

# 3. Création EXPLICITE de postcss.config.js
# C'est ce fichier qui manque souvent et cause l'erreur "PostCSS plugin moved"
echo "⚙️ Génération de postcss.config.js (Correction Erreur)..."
cat > postcss.config.js <<EOF
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# 4. Configuration de tailwind.config.js
echo "⚙️ Génération de tailwind.config.js..."
cat > tailwind.config.js <<EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# 5. Injection des directives Tailwind dans styles.css
echo "💅 Mise à jour de src/styles.css..."
cat > src/styles.css <<EOF
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Styles globaux */
html, body {
    height: 100%;
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
}
EOF

echo "✅ Réparation et installation terminées avec succès !"
echo "👉 Tu peux maintenant lancer :"
echo "   cd $PROJECT_NAME && ng serve"