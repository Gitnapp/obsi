import chalk from 'chalk'
import { getEngine } from '../engine/index.js'
import { vaultExists, VAULT_PATH } from '../utils/config.js'

interface DailyCommandOptions {
  content?: string
  heading?: string
}

export async function dailyCommand(text: string | undefined, opts: DailyCommandOptions) {
  if (!vaultExists()) {
    console.log(chalk.red('Vault not found: ' + VAULT_PATH))
    process.exit(1)
  }

  const content = text ?? opts.content
  if (!content) {
    console.log(chalk.yellow('No content provided.'))
    console.log('Usage: obsi daily "your text" or obsi daily --content "..."')
    process.exit(1)
  }

  const engine = await getEngine()
  await engine.appendDaily(content, opts.heading)

  const today = new Date().toISOString().slice(0, 10)
  console.log(chalk.green('Appended to daily note: ') + chalk.cyan(today))
}
