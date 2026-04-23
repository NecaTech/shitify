#!/bin/bash

# ─────────────────────────────────────────────
# Necatech Boilerplate — Structure initialisation
# ─────────────────────────────────────────────

echo "🏗️  Création de la structure du projet..."

# src/components
mkdir -p src/components/ui
mkdir -p src/components/layout
touch src/components/ui/.gitkeep
touch src/components/layout/.gitkeep

# src/features
mkdir -p src/features
touch src/features/.gitkeep

# src/lib
mkdir -p src/lib/db
mkdir -p src/lib/auth
mkdir -p src/lib/validations
touch src/lib/db/.gitkeep
touch src/lib/auth/.gitkeep
touch src/lib/validations/.gitkeep
touch src/lib/utils.ts

# src/hooks
mkdir -p src/hooks
touch src/hooks/.gitkeep

# src/types
mkdir -p src/types
touch src/types/.gitkeep

# Racine du projet
mkdir -p scripts
mkdir -p docs
touch scripts/.gitkeep
touch docs/.gitkeep

# .env.example
cat > .env.example << 'EOF'
# Base de données
DATABASE_URL=

# Authentification
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅  Structure créée avec succès !"
echo ""
echo "📁  Arborescence :"
find src scripts docs -not -path '*/node_modules/*' | sort
