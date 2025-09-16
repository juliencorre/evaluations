#!/usr/bin/env node

/**
 * Script de test local pour simuler le pipeline CI/CD
 * Exécute toutes les étapes du workflow GitHub Actions en local
 */

import { spawn } from 'child_process'
import { existsSync } from 'fs'

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

class CITester {
  constructor() {
    this.errors = []
    this.warnings = []
    this.startTime = Date.now()
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
  }

  error(message) {
    this.errors.push(message)
    this.log(`❌ ERROR: ${message}`, colors.red)
  }

  warning(message) {
    this.warnings.push(message)
    this.log(`⚠️  WARNING: ${message}`, colors.yellow)
  }

  success(message) {
    this.log(`✅ ${message}`, colors.green)
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue)
  }

  step(message) {
    this.log(`\n${colors.bold}🚀 ${message}${colors.reset}`, colors.cyan)
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      this.info(`Running: ${command} ${args.join(' ')}`)
      
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
          resolve({ stdout, stderr, code })
        } else {
          reject({ stdout, stderr, code })
        }
      })

      child.on('error', (error) => {
        reject({ error: error.message, code: -1 })
      })
    })
  }

  checkPrerequisites() {
    this.step('Checking prerequisites')
    
    // Check if package.json exists
    if (!existsSync('package.json')) {
      this.error('package.json not found')
      return false
    }
    this.success('package.json found')

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      this.warning('node_modules not found, dependencies may not be installed')
    } else {
      this.success('node_modules found')
    }

    return true
  }

  async installDependencies() {
    this.step('Installing dependencies (npm ci)')
    
    try {
      await this.runCommand('npm', ['ci'])
      this.success('Dependencies installed successfully')
      return true
    } catch {
      this.warning(`npm ci failed, trying npm install as fallback`)
      this.info('This might happen if development servers are running')
      
      try {
        await this.runCommand('npm', ['install'])
        this.success('Dependencies installed successfully with npm install')
        return true
      } catch (fallbackError) {
        this.error(`Failed to install dependencies: ${fallbackError.stderr || fallbackError.error}`)
        this.info('💡 Try stopping all development servers and run again')
        return false
      }
    }
  }

  async runLinting() {
    this.step('Running ESLint')
    
    try {
      await this.runCommand('npm', ['run', 'lint'])
      this.success('Linting passed')
      return true
    } catch (error) {
      this.error(`Linting failed:\n${error.stdout || error.stderr || error.error}`)
      return false
    }
  }

  async runUnitTests() {
    this.step('Running unit tests')
    
    try {
      await this.runCommand('npm', ['run', 'test:unit:run'])
      this.success('Unit tests passed')
      return true
    } catch (error) {
      this.error(`Unit tests failed:\n${error.stdout || error.stderr || error.error}`)
      return false
    }
  }

  async buildProject() {
    this.step('Building production bundle')
    
    try {
      await this.runCommand('npm', ['run', 'build'])
      this.success('Build completed successfully')
      
      // Check if dist folder was created
      if (existsSync('dist')) {
        this.success('dist/ folder created')
        return true
      } else {
        this.error('dist/ folder not found after build')
        return false
      }
    } catch (error) {
      this.error(`Build failed:\n${error.stdout || error.stderr || error.error}`)
      return false
    }
  }

  async runE2ETests() {
    this.step('Running E2E tests')
    
    // Check if Playwright is installed
    try {
      await this.runCommand('npx', ['playwright', 'install', 'chromium', '--dry-run'])
    } catch {
      this.info('Installing Playwright browsers...')
      try {
        await this.runCommand('npx', ['playwright', 'install', 'chromium'])
      } catch {
        this.warning('Failed to install Playwright browsers, E2E tests may fail')
      }
    }

    try {
      await this.runCommand('npm', ['run', 'test:e2e'])
      this.success('E2E tests passed')
      return true
    } catch (error) {
      this.error(`E2E tests failed:\n${error.stdout || error.stderr || error.error}`)
      return false
    }
  }

  async runLighthouseCI() {
    this.step('Running Lighthouse CI')
    
    try {
      // Build again to ensure fresh build for Lighthouse
      await this.runCommand('npm', ['run', 'build'])
      await this.runCommand('npx', ['lhci', 'autorun'])
      this.success('Lighthouse CI passed')
      return true
    } catch (error) {
      this.error(`Lighthouse CI failed:\n${error.stdout || error.stderr || error.error}`)
      return false
    }
  }

  async runAll() {
    this.log(`${colors.bold}${colors.magenta}🧪 Starting Local CI/CD Pipeline Test${colors.reset}\n`)
    
    const skipE2E = process.argv.includes('--skip-e2e')
    const skipLighthouse = process.argv.includes('--skip-lighthouse')
    
    const steps = [
      { name: 'Prerequisites', fn: () => this.checkPrerequisites() },
      { name: 'Install Dependencies', fn: () => this.installDependencies() },
      { name: 'Linting', fn: () => this.runLinting() },
      { name: 'Unit Tests', fn: () => this.runUnitTests() },
      { name: 'Build', fn: () => this.buildProject() }
    ]
    
    if (!skipE2E) {
      steps.push({ name: 'E2E Tests', fn: () => this.runE2ETests() })
    } else {
      this.info('Skipping E2E tests (--skip-e2e flag)')
    }
    
    if (!skipLighthouse) {
      steps.push({ name: 'Lighthouse CI', fn: () => this.runLighthouseCI() })
    } else {
      this.info('Skipping Lighthouse CI (--skip-lighthouse flag)')
    }

    const results = []
    
    for (const step of steps) {
      try {
        const result = await step.fn()
        results.push({ name: step.name, success: result })
        
        if (!result) {
          this.log(`\n${colors.red}${colors.bold}❌ Pipeline failed at: ${step.name}${colors.reset}`)
          break
        }
      } catch (error) {
        results.push({ name: step.name, success: false })
        this.error(`Unexpected error in ${step.name}: ${error.message || error}`)
        break
      }
    }

    this.printSummary(results)
  }

  printSummary(results) {
    const duration = Math.round((Date.now() - this.startTime) / 1000)
    
    this.log(`\n${colors.bold}${colors.magenta}📊 CI/CD Pipeline Test Summary${colors.reset}`)
    this.log(`${colors.blue}Duration: ${duration}s${colors.reset}\n`)

    // Print step results
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌'
      const color = result.success ? colors.green : colors.red
      this.log(`${icon} ${color}${result.name}${colors.reset}`)
    })

    // Print statistics
    const passed = results.filter(r => r.success).length
    const total = results.length
    
    this.log(`\n${colors.bold}Results: ${passed}/${total} steps passed${colors.reset}`)
    
    if (this.warnings.length > 0) {
      this.log(`${colors.yellow}Warnings: ${this.warnings.length}${colors.reset}`)
    }
    
    if (this.errors.length > 0) {
      this.log(`${colors.red}Errors: ${this.errors.length}${colors.reset}`)
    }

    // Final verdict
    if (passed === total && this.errors.length === 0) {
      this.log(`\n${colors.green}${colors.bold}🎉 All checks passed! Ready to commit and push.${colors.reset}`)
      process.exit(0)
    } else {
      this.log(`\n${colors.red}${colors.bold}💥 Pipeline failed! Fix the issues before committing.${colors.reset}`)
      process.exit(1)
    }
  }
}

// Run the CI test
const tester = new CITester()
tester.runAll().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})