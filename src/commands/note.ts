import chalk from 'chalk'
import { readFileSync } from 'fs'
import { getEngine } from '../engine/index.js'
import { vaultExists, VAULT_PATH } from '../utils/config.js'

interface NoteCommandOptions {
  content?: string
  area?: string
  project?: string
  resource?: string
  tags?: string
  fromFile?: string
  fromStdin?: boolean
  source?: string
  type?: string
}

export async function noteCommand(title: string, opts: NoteCommandOptions) {
  if (!vaultExists()) {
    console.log(chalk.red('Vault not found: ' + VAULT_PATH))
    process.exit(1)
  }

  let content = opts.content ?? ''

  if (opts.fromFile) {
    content = readFileSync(opts.fromFile, 'utf-8')
  } else if (opts.fromStdin) {
    content = await readStdin()
  }

  if (!content) {
    console.log(chalk.yellow('No content provided. Use --content, --from-file, or --from-stdin'))
    process.exit(1)
  }

  const tags = opts.tags?.split(',').map(t => t.trim()).filter(Boolean) ?? []

  const engine = await getEngine()
  const path = await engine.createNote({
    title,
    content,
    area: opts.area,
    project: opts.project,
    resource: opts.resource,
    tags,
    source: (opts.source as 'claude-code' | 'web' | 'manual' | 'agent') ?? 'agent',
    type: (opts.type as 'note' | 'research' | 'project') ?? 'note',
  })

  console.log(chalk.green('Note created: ') + chalk.cyan(path))
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', chunk => { data += chunk })
    process.stdin.on('end', () => resolve(data))
    // Timeout after 1s if no stdin
    setTimeout(() => resolve(data), 1000)
  })
}
