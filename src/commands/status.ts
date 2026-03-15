import chalk from 'chalk'
import { VAULT_NAME, VAULT_PATH, vaultExists } from '../utils/config.js'
import { isObsidianRunning, isObsidianCLIAvailable } from '../utils/detect.js'
import { getEngine } from '../engine/index.js'

export async function statusCommand() {
  if (!vaultExists()) {
    console.log(chalk.red('Vault not found at: ' + VAULT_PATH))
    return
  }

  const running = await isObsidianRunning()
  const cliAvailable = running && (await isObsidianCLIAvailable())
  const engine = await getEngine()
  const stats = await engine.getStats()

  console.log(chalk.bold('obsi status'))
  console.log('─'.repeat(50))
  console.log(`Vault:     ${chalk.cyan(VAULT_NAME)} (${VAULT_PATH})`)
  console.log(`Obsidian:  ${running ? chalk.green('running') : chalk.yellow('not running')}${cliAvailable ? chalk.green(' (CLI available)') : ''}`)
  console.log(`Engine:    ${cliAvailable ? chalk.green('obsidian-cli') : chalk.blue('direct-file')}`)
  console.log(`Notes:     ${stats.totalNotes} total`)
  console.log(`Workflow:  ${stats.inboxCount} pending input | ${stats.archivedCount} archived`)
  console.log(`Modified:  ${stats.lastModified}`)
}
