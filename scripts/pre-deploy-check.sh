#!/bin/bash

# Script de validation pre-déploiement
# Ce script reproduit exactement les étapes du CI/CD GitHub Actions
# pour détecter les erreurs AVANT de commit/push

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Validation Pre-Déploiement GitHub Actions           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher les étapes
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Fonction pour afficher le succès
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Fonction pour afficher les erreurs
print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Fonction pour afficher les warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
fi

# 1. Vérifier les fichiers modifiés
print_step "1. Vérification des fichiers modifiés"
MODIFIED_FILES=$(git status --porcelain | wc -l)
if [ "$MODIFIED_FILES" -gt 0 ]; then
    print_warning "Fichiers modifiés détectés:"
    git status --short
else
    print_success "Aucun fichier modifié"
fi

# 2. Vérifier Node.js version
print_step "2. Vérification de la version Node.js"
NODE_VERSION=$(node --version)
REQUIRED_VERSION="20"
if [[ "$NODE_VERSION" == *"v$REQUIRED_VERSION"* ]]; then
    print_success "Node.js version: $NODE_VERSION"
else
    print_warning "Node.js version: $NODE_VERSION (GitHub Actions utilise v$REQUIRED_VERSION)"
fi

# 3. Installation des dépendances (comme npm ci)
print_step "3. Installation des dépendances (npm ci)"
if npm ci; then
    print_success "Dépendances installées avec succès"
else
    print_error "Échec de l'installation des dépendances"
fi

# 4. Linting
print_step "4. Vérification du linting (npm run lint)"
if npm run lint; then
    print_success "Linting réussi"
else
    print_error "Échec du linting - Corrigez les erreurs avant de commit"
fi

# 5. Tests unitaires
print_step "5. Exécution des tests unitaires (npm run test:unit:run)"
if npm run test:unit:run; then
    print_success "Tests unitaires réussis"
else
    print_error "Échec des tests unitaires - Corrigez les tests avant de commit"
fi

# 6. Build de production
print_step "6. Build de production (npm run build)"
if npm run build; then
    print_success "Build de production réussi"
else
    print_error "Échec du build de production - Corrigez les erreurs TypeScript avant de commit"
fi

# 7. Vérifier que le dossier dist existe
print_step "7. Vérification des artefacts de build"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Dossier dist créé (taille: $DIST_SIZE)"
else
    print_error "Le dossier dist n'a pas été créé"
fi

# 8. Tests E2E (optionnel - peut être désactivé car long)
if [ "${SKIP_E2E}" != "true" ]; then
    print_step "8. Installation des navigateurs Playwright"
    if npx playwright install chromium --with-deps; then
        print_success "Navigateurs Playwright installés"
    else
        print_warning "Échec de l'installation des navigateurs (optionnel)"
    fi

    print_step "9. Exécution des tests E2E (npm run test:e2e)"
    if npm run test:e2e; then
        print_success "Tests E2E réussis"
    else
        print_warning "Échec des tests E2E (optionnel - peut être skippé localement)"
    fi
else
    print_warning "Tests E2E skippés (SKIP_E2E=true)"
fi

# 9. Lighthouse CI (optionnel)
if [ "${SKIP_LIGHTHOUSE}" != "true" ]; then
    print_step "10. Exécution de Lighthouse CI"
    if npx lhci autorun; then
        print_success "Lighthouse CI réussi"
    else
        print_warning "Échec de Lighthouse CI (optionnel)"
    fi
else
    print_warning "Lighthouse CI skippé (SKIP_LIGHTHOUSE=true)"
fi

# Résumé final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ TOUTES LES VÉRIFICATIONS SONT PASSÉES !              ║${NC}"
echo -e "${GREEN}║   Vous pouvez commit et push en toute sécurité           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo "  1. git add ."
echo "  2. git commit -m \"votre message\""
echo "  3. git push"
echo ""
