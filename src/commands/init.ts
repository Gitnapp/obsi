import chalk from 'chalk'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { saveConfig, configExists, RC_PATH, VAULT_PATH } from '../utils/config.js'
import { createInterface } from 'readline'

export async function initCommand(vaultPath?: string) {
  if (configExists() && !vaultPath) {
    console.log(chalk.yellow(`Config already exists: ${RC_PATH}`))
    console.log(`Vault: ${chalk.cyan(VAULT_PATH)}`)
    console.log(chalk.dim('Use "obsi init <vault-path>" to reconfigure'))
    return
  }

  if (!vaultPath) {
    // Try auto-detect common Obsidian vault locations
    const detected = detectVaults()
    if (detected.length > 0) {
      console.log(chalk.bold('Detected Obsidian vaults:\n'))
      detected.forEach((v, i) => {
        console.log(`  ${chalk.cyan(i + 1)}. ${v}`)
      })
      console.log()

      if (detected.length === 1) {
        vaultPath = detected[0]
        console.log(chalk.green(`Using: ${vaultPath}\n`))
      } else {
        const answer = await ask('Enter number to select (or paste a path): ')
        const num = parseInt(answer, 10)
        vaultPath = num > 0 && num <= detected.length ? detected[num - 1] : answer
      }
    } else {
      vaultPath = await ask('Enter your Obsidian vault path: ')
    }
  }

  if (!vaultPath || !existsSync(vaultPath)) {
    console.log(chalk.red('Path does not exist: ' + (vaultPath || '(empty)')))
    process.exit(1)
  }

  // Detect PARA structure
  const knownAreas = detectAreas(vaultPath)

  saveConfig({
    vaultPath,
    para: {
      resources: '1. Resources',
      projects: '2. Projects',
      areas: '3. Areas',
      archive: '4. Archive',
    },
    inbox: 'Inbox',
    knownAreas,
  })

  console.log(chalk.green('Config saved to: ') + chalk.cyan(RC_PATH))
  console.log(chalk.dim(`Vault: ${vaultPath}`))
  if (knownAreas.length > 0) {
    console.log(chalk.dim(`Areas detected: ${knownAreas.join(', ')}`))
  }
}

function detectVaults(): string[] {
  const home = homedir()
  const candidates = [
    join(home, 'Library/Mobile Documents/iCloud~md~obsidian/Documents'),
    join(home, 'Library/CloudStorage/OneDrive-个人/Obsidian'),
    join(home, 'Documents/Obsidian'),
    join(home, 'Obsidian'),
  ]

  const vaults: string[] = []
  for (const dir of candidates) {
    if (!existsSync(dir)) continue
    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const obsidianDir = join(dir, entry.name, '.obsidian')
          if (existsSync(obsidianDir)) {
            vaults.push(join(dir, entry.name))
          }
        }
      }
    } catch { /* skip */ }
  }
  return vaults
}

function detectAreas(vaultPath: string): string[] {
  const areasDir = join(vaultPath, '3. Areas')
  if (!existsSync(areasDir)) return []
  try {
    return readdirSync(areasDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
  } catch {
    return []
  }
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}
