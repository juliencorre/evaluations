#!/usr/bin/env node

/**
 * Agent de Validation de Déploiement
 *
 * Cet agent automatise la validation pre-déploiement en exécutant
 * toutes les vérifications du CI/CD GitHub Actions en local.
 *
 * Utilisation:
 *   node scripts/deploy-validator-agent.js
 *   node scripts/deploy-validator-agent.js --quick  (skip E2E et Lighthouse)
 *   node scripts/deploy-validator-agent.js --fix    (tente de corriger automatiquement)
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Configuration
const CONFIG = {
  skipE2E: process.argv.includes('--quick') || process.env.SKIP_E2E === 'true',
  skipLighthouse: process.argv.includes('--quick') || process.env.SKIP_LIGHTHOUSE === 'true',
  autoFix: process.argv.includes('--fix'),
  verbose: process.argv.includes('--verbose'),
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// État de validation
const state = {
  checks: [],
  errors: [],
  warnings: [],
  startTime: Date.now(),
};

// Utilitaires d'affichage
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logStep(step, message) {
  log(`\n▶ Étape ${step}: ${message}`, 'blue');
  log('━'.repeat(60), 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
  state.errors.push(message);
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
  state.warnings.push(message);
}

// Exécuter une commande
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr,
    };
  }
}

// Vérifications

async function checkEnvironment() {
  logStep(1, 'Vérification de l\'environnement');

  // Vérifier package.json
  if (!fs.existsSync('package.json')) {
    logError('package.json non trouvé. Exécutez depuis la racine du projet.');
    process.exit(1);
  }
  logSuccess('package.json trouvé');

  // Vérifier Node.js version
  const nodeVersion = process.version;
  const requiredMajor = 20;
  const currentMajor = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (currentMajor === requiredMajor) {
    logSuccess(`Node.js version: ${nodeVersion}`);
  } else {
    logWarning(`Node.js version: ${nodeVersion} (GitHub Actions utilise v${requiredMajor})`);
  }

  // Vérifier git status
  const gitStatus = runCommand('git status --porcelain');
  if (gitStatus.success && gitStatus.output.trim()) {
    logWarning('Fichiers modifiés détectés');
    if (CONFIG.verbose) {
      console.log(gitStatus.output);
    }
  } else {
    logSuccess('Répertoire git propre');
  }

  state.checks.push({ name: 'Environment', passed: true });
}

async function installDependencies() {
  logStep(2, 'Installation des dépendances (npm ci)');

  const result = runCommand('npm ci');

  if (result.success) {
    logSuccess('Dépendances installées avec succès');
    state.checks.push({ name: 'Dependencies', passed: true });
  } else {
    logError('Échec de l\'installation des dépendances');
    if (CONFIG.autoFix) {
      logWarning('Tentative de correction avec npm install...');
      const fixResult = runCommand('npm install');
      if (fixResult.success) {
        logSuccess('Correction réussie avec npm install');
      } else {
        state.checks.push({ name: 'Dependencies', passed: false, error: result.error });
        throw new Error('Impossible d\'installer les dépendances');
      }
    } else {
      state.checks.push({ name: 'Dependencies', passed: false, error: result.error });
      throw new Error('Installation des dépendances échouée');
    }
  }
}

async function runLinting() {
  logStep(3, 'Vérification du linting (npm run lint)');

  const result = runCommand('npm run lint');

  if (result.success) {
    logSuccess('Linting réussi');
    state.checks.push({ name: 'Linting', passed: true });
  } else {
    logError('Échec du linting');

    if (CONFIG.autoFix) {
      logWarning('Tentative de correction automatique...');
      const fixResult = runCommand('npm run lint -- --fix');
      if (fixResult.success) {
        logSuccess('Erreurs de linting corrigées automatiquement');
      } else {
        state.checks.push({ name: 'Linting', passed: false, error: result.stderr });
        throw new Error('Linting échoué - Corrigez manuellement');
      }
    } else {
      state.checks.push({ name: 'Linting', passed: false, error: result.stderr });
      throw new Error('Linting échoué - Utilisez --fix pour corriger automatiquement');
    }
  }
}

async function runUnitTests() {
  logStep(4, 'Exécution des tests unitaires (npm run test:unit:run)');

  const result = runCommand('npm run test:unit:run');

  if (result.success) {
    logSuccess('Tests unitaires réussis');
    state.checks.push({ name: 'Unit Tests', passed: true });
  } else {
    logError('Échec des tests unitaires');
    state.checks.push({ name: 'Unit Tests', passed: false, error: result.stderr });
    throw new Error('Tests unitaires échoués');
  }
}

async function runBuild() {
  logStep(5, 'Build de production (npm run build)');

  const result = runCommand('npm run build');

  if (result.success) {
    logSuccess('Build de production réussi');

    // Vérifier que dist existe
    if (fs.existsSync('dist')) {
      logSuccess('Dossier dist créé');
      state.checks.push({ name: 'Build', passed: true });
    } else {
      logError('Le dossier dist n\'a pas été créé');
      state.checks.push({ name: 'Build', passed: false, error: 'dist folder missing' });
      throw new Error('Build incomplet');
    }
  } else {
    logError('Échec du build de production');
    state.checks.push({ name: 'Build', passed: false, error: result.stderr });
    throw new Error('Build échoué - Corrigez les erreurs TypeScript');
  }
}

async function runE2ETests() {
  if (CONFIG.skipE2E) {
    logWarning('Tests E2E skippés (--quick ou SKIP_E2E=true)');
    return;
  }

  logStep(6, 'Installation des navigateurs Playwright');
  const installResult = runCommand('npx playwright install chromium --with-deps');

  if (installResult.success) {
    logSuccess('Navigateurs Playwright installés');
  } else {
    logWarning('Échec de l\'installation des navigateurs (optionnel)');
  }

  logStep(7, 'Exécution des tests E2E (npm run test:e2e)');
  const result = runCommand('npm run test:e2e');

  if (result.success) {
    logSuccess('Tests E2E réussis');
    state.checks.push({ name: 'E2E Tests', passed: true });
  } else {
    logWarning('Échec des tests E2E (optionnel)');
    state.checks.push({ name: 'E2E Tests', passed: false, optional: true });
  }
}

async function runLighthouse() {
  if (CONFIG.skipLighthouse) {
    logWarning('Lighthouse CI skippé (--quick ou SKIP_LIGHTHOUSE=true)');
    return;
  }

  logStep(8, 'Exécution de Lighthouse CI');
  const result = runCommand('npx lhci autorun');

  if (result.success) {
    logSuccess('Lighthouse CI réussi');
    state.checks.push({ name: 'Lighthouse', passed: true });
  } else {
    logWarning('Échec de Lighthouse CI (optionnel)');
    state.checks.push({ name: 'Lighthouse', passed: false, optional: true });
  }
}

function printSummary() {
  const duration = ((Date.now() - state.startTime) / 1000).toFixed(2);
  const passed = state.checks.filter(c => c.passed).length;
  const failed = state.checks.filter(c => !c.passed && !c.optional).length;
  const optional = state.checks.filter(c => !c.passed && c.optional).length;

  log('\n' + '═'.repeat(60), 'blue');
  log('📊 RÉSUMÉ DE LA VALIDATION', 'bright');
  log('═'.repeat(60), 'blue');

  log(`\n⏱  Durée: ${duration}s`, 'cyan');
  log(`✓ Réussis: ${passed}`, 'green');

  if (failed > 0) {
    log(`✗ Échoués: ${failed}`, 'red');
  }

  if (optional > 0) {
    log(`⚠ Optionnels échoués: ${optional}`, 'yellow');
  }

  if (state.errors.length > 0) {
    log('\n❌ ERREURS CRITIQUES:', 'red');
    state.errors.forEach(err => log(`  • ${err}`, 'red'));
  }

  if (state.warnings.length > 0) {
    log('\n⚠️  AVERTISSEMENTS:', 'yellow');
    state.warnings.forEach(warn => log(`  • ${warn}`, 'yellow'));
  }

  if (failed === 0) {
    log('\n' + '═'.repeat(60), 'green');
    log('✓ TOUTES LES VÉRIFICATIONS CRITIQUES SONT PASSÉES !', 'green');
    log('  Vous pouvez commit et push en toute sécurité', 'green');
    log('═'.repeat(60), 'green');

    log('\n📝 Prochaines étapes:', 'blue');
    log('  1. git add .', 'cyan');
    log('  2. git commit -m "votre message"', 'cyan');
    log('  3. git push', 'cyan');

    process.exit(0);
  } else {
    log('\n' + '═'.repeat(60), 'red');
    log('✗ DES VÉRIFICATIONS ONT ÉCHOUÉ', 'red');
    log('  Corrigez les erreurs avant de commit', 'red');
    log('═'.repeat(60), 'red');

    if (!CONFIG.autoFix) {
      log('\n💡 Astuce: Utilisez --fix pour tenter une correction automatique', 'yellow');
    }

    process.exit(1);
  }
}

// Programme principal
async function main() {
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║   🤖 Agent de Validation de Déploiement                  ║', 'blue');
  log('║   Reproduit exactement le CI/CD GitHub Actions           ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  if (CONFIG.autoFix) {
    log('\n🔧 Mode auto-fix activé', 'yellow');
  }

  if (CONFIG.skipE2E || CONFIG.skipLighthouse) {
    log('\n⚡ Mode rapide activé (E2E et Lighthouse skippés)', 'yellow');
  }

  try {
    await checkEnvironment();
    await installDependencies();
    await runLinting();
    await runUnitTests();
    await runBuild();
    await runE2ETests();
    await runLighthouse();

    printSummary();
  } catch (error) {
    log(`\n💥 Erreur fatale: ${error.message}`, 'red');
    printSummary();
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  log('\n\n⚠️  Validation interrompue par l\'utilisateur', 'yellow');
  printSummary();
});

// Exécution
main().catch(error => {
  log(`\n💥 Erreur non gérée: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
