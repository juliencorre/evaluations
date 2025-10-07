# Script de validation pre-déploiement pour Windows PowerShell
# Ce script reproduit exactement les étapes du CI/CD GitHub Actions
# pour détecter les erreurs AVANT de commit/push

$ErrorActionPreference = "Stop"

# Fonctions d'affichage
function Print-Step {
    param($Message)
    Write-Host "`n▶ $Message" -ForegroundColor Blue
    Write-Host ("━" * 60) -ForegroundColor Blue
}

function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    exit 1
}

function Print-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Header
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   🚀 Validation Pre-Déploiement GitHub Actions           ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Print-Error "Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
}

# 1. Vérifier les fichiers modifiés
Print-Step "1. Vérification des fichiers modifiés"
try {
    $modifiedFiles = git status --porcelain
    if ($modifiedFiles) {
        Print-Warning "Fichiers modifiés détectés:"
        git status --short
    } else {
        Print-Success "Aucun fichier modifié"
    }
} catch {
    Print-Warning "Impossible de vérifier le statut git"
}

# 2. Vérifier Node.js version
Print-Step "2. Vérification de la version Node.js"
$nodeVersion = node --version
$requiredVersion = "v20"
if ($nodeVersion -like "$requiredVersion*") {
    Print-Success "Node.js version: $nodeVersion"
} else {
    Print-Warning "Node.js version: $nodeVersion (GitHub Actions utilise $requiredVersion)"
}

# 3. Installation des dépendances
Print-Step "3. Installation des dépendances (npm ci)"
try {
    npm ci
    Print-Success "Dépendances installées avec succès"
} catch {
    Print-Error "Échec de l'installation des dépendances"
}

# 4. Linting
Print-Step "4. Vérification du linting (npm run lint)"
try {
    npm run lint
    Print-Success "Linting réussi"
} catch {
    Print-Error "Échec du linting - Corrigez les erreurs avant de commit"
}

# 5. Tests unitaires
Print-Step "5. Exécution des tests unitaires (npm run test:unit:run)"
try {
    npm run test:unit:run
    Print-Success "Tests unitaires réussis"
} catch {
    Print-Error "Échec des tests unitaires - Corrigez les tests avant de commit"
}

# 6. Build de production
Print-Step "6. Build de production (npm run build)"
try {
    npm run build
    Print-Success "Build de production réussi"
} catch {
    Print-Error "Échec du build de production - Corrigez les erreurs TypeScript avant de commit"
}

# 7. Vérifier que le dossier dist existe
Print-Step "7. Vérification des artefacts de build"
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Print-Success "Dossier dist créé (taille: $([math]::Round($distSize, 2)) MB)"
} else {
    Print-Error "Le dossier dist n'a pas été créé"
}

# 8. Tests E2E (optionnel)
if ($env:SKIP_E2E -ne "true") {
    Print-Step "8. Installation des navigateurs Playwright"
    try {
        npx playwright install chromium --with-deps
        Print-Success "Navigateurs Playwright installés"
    } catch {
        Print-Warning "Échec de l'installation des navigateurs (optionnel)"
    }

    Print-Step "9. Exécution des tests E2E (npm run test:e2e)"
    try {
        npm run test:e2e
        Print-Success "Tests E2E réussis"
    } catch {
        Print-Warning "Échec des tests E2E (optionnel - peut être skippé localement)"
    }
} else {
    Print-Warning "Tests E2E skippés (SKIP_E2E=true)"
}

# 9. Lighthouse CI (optionnel)
if ($env:SKIP_LIGHTHOUSE -ne "true") {
    Print-Step "10. Exécution de Lighthouse CI"
    try {
        npx lhci autorun
        Print-Success "Lighthouse CI réussi"
    } catch {
        Print-Warning "Échec de Lighthouse CI (optionnel)"
    }
} else {
    Print-Warning "Lighthouse CI skippé (SKIP_LIGHTHOUSE=true)"
}

# Résumé final
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ TOUTES LES VÉRIFICATIONS SONT PASSÉES !              ║" -ForegroundColor Green
Write-Host "║   Vous pouvez commit et push en toute sécurité           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Blue
Write-Host "  1. git add ."
Write-Host "  2. git commit -m `"votre message`""
Write-Host "  3. git push"
Write-Host ""
