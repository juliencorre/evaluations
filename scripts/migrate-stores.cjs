#!/usr/bin/env node

/**
 * Script de migration automatique pour le refactoring des stores Pinia
 *
 * Ce script remplace les anciennes références aux stores (pattern export function)
 * par les nouvelles références (pattern defineStore) qui n'utilisent pas .value
 *
 * Usage: node scripts/migrate-stores.js [--dry-run]
 */

const fs = require('fs')
const path = require('path')

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const ROOT_DIR = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT_DIR, 'src')

// Patterns de remplacement
const REPLACEMENTS = [
  // Students Store
  {
    pattern: /studentsStore\.allStudents\.value/g,
    replacement: 'studentsStore.allStudents',
    description: 'studentsStore.allStudents.value → studentsStore.allStudents'
  },
  {
    pattern: /studentsStore\.activeStudents\.value/g,
    replacement: 'studentsStore.activeStudents',
    description: 'studentsStore.activeStudents.value → studentsStore.activeStudents'
  },
  {
    pattern: /studentsStore\.studentCount\.value/g,
    replacement: 'studentsStore.studentCount',
    description: 'studentsStore.studentCount.value → studentsStore.studentCount'
  },
  {
    pattern: /studentsStore\.isLoading\.value/g,
    replacement: 'studentsStore.isLoading',
    description: 'studentsStore.isLoading.value → studentsStore.isLoading'
  },
  {
    pattern: /studentsStore\.error\.value/g,
    replacement: 'studentsStore.error',
    description: 'studentsStore.error.value → studentsStore.error'
  },
  {
    pattern: /studentsStore\.useSupabase\.value/g,
    replacement: 'studentsStore.useSupabase',
    description: 'studentsStore.useSupabase.value → studentsStore.useSupabase'
  },
  {
    pattern: /studentsStore\.students\.value/g,
    replacement: 'studentsStore.students',
    description: 'studentsStore.students.value → studentsStore.students'
  },

  // Competency Framework Store
  {
    pattern: /frameworkStore\.framework\.value/g,
    replacement: 'frameworkStore.framework',
    description: 'frameworkStore.framework.value → frameworkStore.framework'
  },
  {
    pattern: /frameworkStore\.isLoading\.value/g,
    replacement: 'frameworkStore.isLoading',
    description: 'frameworkStore.isLoading.value → frameworkStore.isLoading'
  },
  {
    pattern: /frameworkStore\.error\.value/g,
    replacement: 'frameworkStore.error',
    description: 'frameworkStore.error.value → frameworkStore.error'
  },
  {
    pattern: /frameworkStore\.hasData\.value/g,
    replacement: 'frameworkStore.hasData',
    description: 'frameworkStore.hasData.value → frameworkStore.hasData'
  },
  {
    pattern: /frameworkStore\.domainCount\.value/g,
    replacement: 'frameworkStore.domainCount',
    description: 'frameworkStore.domainCount.value → frameworkStore.domainCount'
  },
  {
    pattern: /frameworkStore\.isCompetenciesLoading\.value/g,
    replacement: 'frameworkStore.isLoading',
    description: 'frameworkStore.isCompetenciesLoading.value → frameworkStore.isLoading'
  },
  {
    pattern: /frameworkStore\.competenciesError\.value/g,
    replacement: 'frameworkStore.error',
    description: 'frameworkStore.competenciesError.value → frameworkStore.error'
  },

  // Evaluation Store
  {
    pattern: /evaluationStore\.allEvaluations\.value/g,
    replacement: 'evaluationStore.allEvaluations',
    description: 'evaluationStore.allEvaluations.value → evaluationStore.allEvaluations'
  },
  {
    pattern: /evaluationStore\.currentEvaluation\.value/g,
    replacement: 'evaluationStore.currentEvaluation',
    description: 'evaluationStore.currentEvaluation.value → evaluationStore.currentEvaluation'
  },
  {
    pattern: /evaluationStore\.getCurrentEvaluation\.value/g,
    replacement: 'evaluationStore.getCurrentEvaluation',
    description: 'evaluationStore.getCurrentEvaluation.value → evaluationStore.getCurrentEvaluation'
  },
  {
    pattern: /evaluationStore\.isLoading\.value/g,
    replacement: 'evaluationStore.isLoading',
    description: 'evaluationStore.isLoading.value → evaluationStore.isLoading'
  },
  {
    pattern: /evaluationStore\.evaluationCount\.value/g,
    replacement: 'evaluationStore.evaluationCount',
    description: 'evaluationStore.evaluationCount.value → evaluationStore.evaluationCount'
  },
  {
    pattern: /evaluationStore\.hasEvaluations\.value/g,
    replacement: 'evaluationStore.hasEvaluations',
    description: 'evaluationStore.hasEvaluations.value → evaluationStore.hasEvaluations'
  },
  {
    pattern: /evaluationStore\.evaluations\.value/g,
    replacement: 'evaluationStore.evaluations',
    description: 'evaluationStore.evaluations.value → evaluationStore.evaluations'
  },

  // useCompetencyFrameworkStore() inline calls
  {
    pattern: /useCompetencyFrameworkStore\(\)\.framework\.value/g,
    replacement: 'useCompetencyFrameworkStore().framework',
    description: 'useCompetencyFrameworkStore().framework.value → useCompetencyFrameworkStore().framework'
  },

  // Nested property access (framework store)
  {
    pattern: /const framework = frameworkStore\.framework\.value/g,
    replacement: 'const framework = frameworkStore.framework',
    description: 'const framework = frameworkStore.framework.value → const framework = frameworkStore.framework'
  },
  {
    pattern: /frameworkStore\.framework\.value\.id/g,
    replacement: 'frameworkStore.framework.id',
    description: 'frameworkStore.framework.value.id → frameworkStore.framework.id'
  },
  {
    pattern: /frameworkStore\.framework\.value\.domains/g,
    replacement: 'frameworkStore.framework.domains',
    description: 'frameworkStore.framework.value.domains → frameworkStore.framework.domains'
  },

  // Old property names that changed
  {
    pattern: /frameworkStore\.isCompetenciesLoading/g,
    replacement: 'frameworkStore.isLoading',
    description: 'frameworkStore.isCompetenciesLoading → frameworkStore.isLoading'
  },
  {
    pattern: /frameworkStore\.competenciesError/g,
    replacement: 'frameworkStore.error',
    description: 'frameworkStore.competenciesError → frameworkStore.error'
  },

  // currentEvaluation checks
  {
    pattern: /currentEvaluation\.value\?/g,
    replacement: 'currentEvaluation?',
    description: 'currentEvaluation.value? → currentEvaluation?'
  },
  {
    pattern: /evaluationStore\.currentEvaluation\?\.value/g,
    replacement: 'evaluationStore.currentEvaluation',
    description: 'evaluationStore.currentEvaluation?.value → evaluationStore.currentEvaluation'
  }
]

// Extensions de fichiers à traiter
const FILE_EXTENSIONS = ['.vue', '.ts', '.js']

// Fichiers à exclure
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /dist/,
  /\.git/,
  /scripts\/migrate-stores\.js/,
  /src\/stores\/modules\//,  // Ne pas modifier les nouveaux stores
  /src\/stores\/studentsStore\.ts/,  // Déjà migré (re-export seulement)
  /src\/stores\/evaluationStore\.ts/,  // Déjà migré (re-export seulement)
  /src\/stores\/index\.ts/  // Fichier d'export centralisé
]

// Statistiques
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0,
  replacementsByPattern: {}
}

/**
 * Vérifie si un fichier doit être exclu
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))
}

/**
 * Vérifie si un fichier doit être traité
 */
function shouldProcess(filePath) {
  const ext = path.extname(filePath)
  return FILE_EXTENSIONS.includes(ext) && !shouldExclude(filePath)
}

/**
 * Récupère tous les fichiers à traiter récursivement
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else if (shouldProcess(filePath)) {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}

/**
 * Traite un fichier et applique les remplacements
 */
function processFile(filePath) {
  stats.filesProcessed++

  const originalContent = fs.readFileSync(filePath, 'utf8')
  let modifiedContent = originalContent
  let fileModified = false
  let fileReplacements = 0

  REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const matches = modifiedContent.match(pattern)
    if (matches) {
      const count = matches.length
      modifiedContent = modifiedContent.replace(pattern, replacement)
      fileModified = true
      fileReplacements += count

      stats.totalReplacements += count
      stats.replacementsByPattern[description] = (stats.replacementsByPattern[description] || 0) + count

      console.log(`  ✓ ${count}x ${description}`)
    }
  })

  if (fileModified) {
    stats.filesModified++
    const relativePath = path.relative(ROOT_DIR, filePath)
    console.log(`\n📝 ${relativePath}`)
    console.log(`   ${fileReplacements} remplacement(s)\n`)

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8')
    }
  }

  return fileModified
}

/**
 * Fonction principale
 */
function main() {
  console.log('🚀 Migration automatique des stores Pinia\n')
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (aucune modification)' : '✍️  ÉCRITURE (modifications appliquées)'}\n`)
  console.log('─'.repeat(80))

  const startTime = Date.now()
  const files = getAllFiles(SRC_DIR)

  console.log(`\n📂 ${files.length} fichiers à analyser...\n`)

  files.forEach(processFile)

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n' + '─'.repeat(80))
  console.log('\n📊 RÉSUMÉ DE LA MIGRATION\n')
  console.log(`Fichiers analysés:  ${stats.filesProcessed}`)
  console.log(`Fichiers modifiés:  ${stats.filesModified}`)
  console.log(`Total remplacements: ${stats.totalReplacements}`)
  console.log(`Durée: ${duration}s`)

  if (Object.keys(stats.replacementsByPattern).length > 0) {
    console.log('\n📋 DÉTAILS PAR PATTERN:\n')
    Object.entries(stats.replacementsByPattern)
      .sort((a, b) => b[1] - a[1])
      .forEach(([pattern, count]) => {
        console.log(`  ${count.toString().padStart(3)}x  ${pattern}`)
      })
  }

  if (DRY_RUN) {
    console.log('\n⚠️  Mode DRY RUN: Aucune modification appliquée')
    console.log('💡 Exécutez sans --dry-run pour appliquer les changements')
  } else {
    console.log('\n✅ Migration terminée avec succès!')
    console.log('💡 Lancez "npm run build" pour vérifier que tout fonctionne')
  }

  console.log('\n' + '─'.repeat(80) + '\n')
}

// Exécution
try {
  main()
  process.exit(0)
} catch (error) {
  console.error('\n❌ Erreur lors de la migration:', error.message)
  console.error(error.stack)
  process.exit(1)
}
