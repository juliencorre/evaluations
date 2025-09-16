#!/usr/bin/env node

/**
 * Agent autonome pour Claude Code - Correction automatique des erreurs CI
 *
 * Cette commande exécute le script CI et corrige automatiquement les erreurs détectées.
 * Elle peut être invoquée via la commande Claude Code: /ci-fix
 */

import { spawn } from 'child_process'

// Couleurs pour l'affichage console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

class CIAutoFixer {
  constructor() {
    this.maxAttempts = 3
    this.skipE2E = false
    this.skipLighthouse = false
    this.currentAttempt = 0
    this.errors = []
    this.fixes = []

    // Parser les arguments de ligne de commande
    this.parseArguments()
  }

  parseArguments() {
    const args = process.argv.slice(2)

    args.forEach(arg => {
      if (arg === '--skip-e2e') {
        this.skipE2E = true
      } else if (arg === '--skip-lighthouse') {
        this.skipLighthouse = true
      } else if (arg.startsWith('--max-attempts=')) {
        this.maxAttempts = parseInt(arg.split('=')[1]) || 3
      }
    })
  }

  log(message) {
    console.log(message)
  }

  info(message) {
    this.log(`${colors.blue}ℹ️  ${message}${colors.reset}`)
  }

  success(message) {
    this.log(`${colors.green}✅ ${message}${colors.reset}`)
  }

  error(message) {
    this.log(`${colors.red}❌ ${message}${colors.reset}`)
  }

  warning(message) {
    this.log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
  }

  step(message) {
    this.log(`${colors.cyan}\\n${colors.bright}🚀 ${message}${colors.reset}${colors.cyan}${colors.reset}`)
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          reject({
            code,
            stdout,
            stderr,
            error: new Error(`Command failed with code ${code}`)
          })
        }
      })

      child.on('error', (error) => {
        reject({ error, stdout, stderr })
      })
    })
  }

  async runCI() {
    const ciArgs = ['run', 'test:ci']

    if (this.skipE2E) {
      ciArgs.push('--', '--skip-e2e')
    }
    if (this.skipLighthouse) {
      ciArgs.push('--', '--skip-lighthouse')
    }

    try {
      const result = await this.runCommand('npm', ciArgs)
      return { success: true, output: result.stdout }
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.stderr || error.error?.message || 'Unknown error'
      }
    }
  }

  analyzeErrors(output) {
    const errors = []

    // Détecter les erreurs ESLint
    if (output.includes('error') && output.includes('eslint')) {
      const eslintErrors = output.match(/.*error.*/g) || []
      errors.push({
        type: 'eslint',
        description: 'ESLint errors detected',
        details: eslintErrors
      })
    }

    // Détecter les erreurs TypeScript
    if (output.includes('TS') && output.includes('error')) {
      const tsErrors = output.match(/error TS\\d+:.*/g) || []
      errors.push({
        type: 'typescript',
        description: 'TypeScript errors detected',
        details: tsErrors
      })
    }

    // Détecter les erreurs de build
    if (output.includes('Build failed') || output.includes('build error')) {
      errors.push({
        type: 'build',
        description: 'Build errors detected',
        details: [output]
      })
    }

    // Détecter les erreurs de tests
    if (output.includes('test') && output.includes('failed')) {
      errors.push({
        type: 'test',
        description: 'Unit test failures detected',
        details: [output]
      })
    }

    return errors
  }

  async fixESLintErrors() {
    this.info('Attempting to fix ESLint errors...')

    try {
      await this.runCommand('npm', ['run', 'lint', '--', '--fix'])
      this.fixes.push('Fixed ESLint errors automatically')
      return true
    } catch {
      this.warning('Could not auto-fix all ESLint errors')
      return false
    }
  }

  async fixTypeScriptErrors() {
    this.info('Analyzing TypeScript errors for auto-fix...')

    // Pour les erreurs TypeScript, on ne peut pas toujours auto-fixer
    // mais on peut donner des suggestions spécifiques
    this.warning('TypeScript errors require manual intervention')
    this.info('Common fixes:')
    this.info('- Add proper type annotations')
    this.info('- Fix null safety issues with optional chaining')
    this.info('- Import missing types')

    return false
  }

  async fixBuildErrors() {
    this.info('Analyzing build errors...')
    this.warning('Build errors usually require manual code fixes')
    return false
  }

  async fixTestErrors() {
    this.info('Analyzing test failures...')
    this.warning('Test failures require review of test logic and implementation')
    return false
  }

  async attemptFixes(errors) {
    let fixedSomething = false

    for (const error of errors) {
      switch (error.type) {
        case 'eslint':
          if (await this.fixESLintErrors()) {
            fixedSomething = true
          }
          break
        case 'typescript':
          await this.fixTypeScriptErrors()
          break
        case 'build':
          await this.fixBuildErrors()
          break
        case 'test':
          await this.fixTestErrors()
          break
      }
    }

    return fixedSomething
  }

  async run() {
    this.log(`${colors.bright}${colors.magenta}🤖 Claude Code CI Auto-Fixer${colors.reset}\\n`)

    this.info(`Max attempts: ${this.maxAttempts}`)
    if (this.skipE2E) this.info('Skipping E2E tests')
    if (this.skipLighthouse) this.info('Skipping Lighthouse tests')

    while (this.currentAttempt < this.maxAttempts) {
      this.currentAttempt++

      this.step(`Attempt ${this.currentAttempt}/${this.maxAttempts}: Running CI pipeline`)

      const result = await this.runCI()

      if (result.success) {
        this.success('🎉 All CI tests passed!')
        this.printSummary(true)
        return
      }

      this.error(`CI failed on attempt ${this.currentAttempt}`)

      // Analyser les erreurs
      const errors = this.analyzeErrors(result.output)
      this.errors = [...this.errors, ...errors]

      if (errors.length === 0) {
        this.warning('No recognizable errors found in output')
        break
      }

      this.info(`Found ${errors.length} types of errors:`)
      errors.forEach(error => {
        this.log(`  • ${error.description}`)
      })

      // Tenter de corriger
      const fixedSomething = await this.attemptFixes(errors)

      if (!fixedSomething && this.currentAttempt < this.maxAttempts) {
        this.warning('No automatic fixes available, stopping attempts')
        break
      }
    }

    this.error('Failed to fix all issues automatically')
    this.printSummary(false)
  }

  printSummary(success) {
    this.log(`\\n${colors.bright}${colors.magenta}📊 Auto-Fix Summary${colors.reset}`)

    if (success) {
      this.success('All CI tests now pass!')
    } else {
      this.error('Some issues remain unfixed')
    }

    if (this.fixes.length > 0) {
      this.log(`\\n${colors.green}Fixes applied:${colors.reset}`)
      this.fixes.forEach(fix => {
        this.log(`  ✅ ${fix}`)
      })
    }

    if (this.errors.length > 0) {
      this.log(`\\n${colors.yellow}Issues detected:${colors.reset}`)
      const uniqueErrors = [...new Set(this.errors.map(e => e.description))]
      uniqueErrors.forEach(error => {
        this.log(`  ⚠️  ${error}`)
      })
    }

    this.log(`\\n${colors.blue}Next steps:${colors.reset}`)
    if (success) {
      this.log('  • Ready to commit your changes')
      this.log('  • Run git add . && git commit to save your work')
    } else {
      this.log('  • Review the remaining errors manually')
      this.log('  • Fix TypeScript/build issues in your code')
      this.log('  • Run npm run test:ci again when ready')
    }
  }
}

// Exécuter l'agent si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoFixer = new CIAutoFixer()
  autoFixer.run().catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
}

export default CIAutoFixer