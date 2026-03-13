import chalk from 'chalk'
import { getEngine } from '../engine/index.js'
import { vaultExists, VAULT_PATH } from '../utils/config.js'

interface CollectCommandOptions {
  text?: string
  title?: string
  area?: string
  resource?: string
  tags?: string
}

export async function collectCommand(urlOrEmpty: string | undefined, opts: CollectCommandOptions) {
  if (!vaultExists()) {
    console.log(chalk.red('Vault not found: ' + VAULT_PATH))
    process.exit(1)
  }

  let content: string
  let title: string

  if (urlOrEmpty && urlOrEmpty.startsWith('http')) {
    // URL collection - for now, store URL reference
    // Full content extraction would require a fetcher (future enhancement)
    title = opts.title ?? urlOrEmpty
    content = `## Source\n\n${urlOrEmpty}\n\n## Notes\n\n${opts.text ?? '(待整理)'}`
    console.log(chalk.dim('URL captured. Content extraction available when used with Claude Code /collect skill.'))
  } else if (opts.text) {
    title = opts.title ?? `Collected ${new Date().toISOString().slice(0, 10)}`
    content = opts.text
  } else {
    console.log(chalk.yellow('Provide a URL or --text'))
    console.log('Usage: obsi collect "https://..." or obsi collect --text "..."')
    process.exit(1)
  }

  const tags = opts.tags?.split(',').map(t => t.trim()).filter(Boolean) ?? []
  const engine = await getEngine()

  const path = await engine.createNote({
    title,
    content,
    area: opts.area,
    resource: opts.resource ?? 'Collected',
    tags,
    source: 'web',
    type: 'research',
  })

  console.log(chalk.green('Collected: ') + chalk.cyan(path))
}
