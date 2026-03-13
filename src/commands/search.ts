import chalk from 'chalk'
import { getEngine } from '../engine/index.js'
import { vaultExists, VAULT_PATH } from '../utils/config.js'

interface SearchCommandOptions {
  area?: string
  tags?: string
  limit?: string
}

export async function searchCommand(query: string, opts: SearchCommandOptions) {
  if (!vaultExists()) {
    console.log(chalk.red('Vault not found: ' + VAULT_PATH))
    process.exit(1)
  }

  const tags = opts.tags?.split(',').map(t => t.trim()).filter(Boolean)
  const limit = opts.limit ? parseInt(opts.limit, 10) : 20

  const engine = await getEngine()
  const results = await engine.search(query, { area: opts.area, tags, limit })

  if (results.length === 0) {
    console.log(chalk.yellow('No results found.'))
    return
  }

  console.log(chalk.bold(`Found ${results.length} results:\n`))
  for (const r of results) {
    console.log(chalk.cyan(r.path))
    console.log(`  ${chalk.bold(r.title)}`)
    if (r.snippet) console.log(`  ${chalk.dim(r.snippet)}`)
    console.log()
  }
}
