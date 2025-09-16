#!/usr/bin/env node

/**
 * Commande Claude Code personnalisée : /ci-fix
 *
 * Lance un agent autonome qui exécute le script CI et corrige automatiquement
 * toutes les erreurs détectées (ESLint, TypeScript, Build, Tests).
 */

// Import removed as spawn is not used in this implementation

class CIFixCommand {
  constructor() {
    this.name = 'ci-fix'
    this.description = 'Lance un agent autonome pour corriger automatiquement les erreurs CI'
    this.usage = '/ci-fix [--skip-e2e] [--skip-lighthouse] [--max-attempts=3]'
  }

  async execute(args = []) {
    console.log('🤖 Lancement de l\'agent autonome CI-Fix...\n')

    // Parser les arguments
    const skipE2E = args.includes('--skip-e2e')
    const skipLighthouse = args.includes('--skip-lighthouse')
    const maxAttemptsArg = args.find(arg => arg.startsWith('--max-attempts='))
    const maxAttempts = maxAttemptsArg ? parseInt(maxAttemptsArg.split('=')[1]) : 3

    console.log(`📋 Configuration:`)
    console.log(`   - Skip E2E: ${skipE2E}`)
    console.log(`   - Skip Lighthouse: ${skipLighthouse}`)
    console.log(`   - Max attempts: ${maxAttempts}\n`)

    // Construire la commande Task pour Claude Code
    const taskPrompt = `
Tu es un agent autonome spécialisé dans la correction automatique des erreurs CI/CD.

MISSION: Exécuter le script CI et corriger automatiquement toutes les erreurs détectables.

CONFIGURATION:
- Skip E2E: ${skipE2E}
- Skip Lighthouse: ${skipLighthouse}
- Max attempts: ${maxAttempts}

ÉTAPES À SUIVRE:
1. Exécuter 'npm run test:ci${skipE2E ? ' --skip-e2e' : ''}${skipLighthouse ? ' --skip-lighthouse' : ''}' pour identifier les erreurs
2. Analyser la sortie pour détecter les types d'erreurs (ESLint, TypeScript, Build, Tests)
3. Appliquer les corrections automatiques appropriées:
   - ESLint: Utiliser 'npm run lint' pour auto-fix
   - TypeScript: Ajouter types manquants, corrections de null safety
   - Build: Corriger imports, syntaxe
   - Tests: Ajuster mocks et assertions
4. Relancer le CI jusqu'à ce que tous les tests passent (max ${maxAttempts} tentatives)
5. Fournir un rapport détaillé des corrections effectuées

RÈGLES:
- Toujours commencer par exécuter le CI pour identifier les erreurs
- Ne pas modifier la logique métier, seulement corriger les erreurs de qualité
- Utiliser les outils de correction automatique quand disponibles
- Si une erreur ne peut pas être corrigée automatiquement, donner des instructions précises
- Arrêter après ${maxAttempts} tentatives ou si aucune correction automatique n'est possible

RETOUR ATTENDU:
- Statut final du CI (succès/échec)
- Liste des corrections appliquées
- Instructions pour les erreurs restantes
- Prochaines étapes recommandées
`

    // Afficher le prompt que Claude Code doit utiliser
    console.log('🎯 Prompt pour l\'agent Claude Code:')
    console.log('━'.repeat(80))
    console.log(taskPrompt)
    console.log('━'.repeat(80))
    console.log('\n📝 Pour exécuter cet agent dans Claude Code, utilisez:')
    console.log('   Task tool avec subagent_type: "general-purpose"')
    console.log('\n✨ Ou utilisez directement: npm run ci-fix')

    return {
      success: true,
      message: 'Agent CI-Fix configuré et prêt à être exécuté'
    }
  }
}

// Exporter pour Claude Code
module.exports = CIFixCommand

// Exécution directe en ligne de commande
if (require.main === module) {
  const command = new CIFixCommand()
  const args = process.argv.slice(2)

  command.execute(args).then(result => {
    if (result.success) {
      console.log(`\n✅ ${result.message}`)
    } else {
      console.error(`\n❌ ${result.message}`)
      process.exit(1)
    }
  }).catch(error => {
    console.error('\n💥 Erreur inattendue:', error.message)
    process.exit(1)
  })
}