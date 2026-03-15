import chalk from 'chalk'
import { readFile, writeFile } from 'fs/promises'
import { join, basename } from 'path'
import { glob } from 'glob'
import { getVaultPath, INBOX_DIR, KNOWN_AREAS, PARA, ARCHIVED_DIR } from '../utils/config.js'
import { parseNote } from '../utils/frontmatter.js'

interface OrganizeCommandOptions {
  path?: string
  area?: string
}

export async function organizeCommand(subcommand: string, opts: OrganizeCommandOptions) {
  switch (subcommand) {
    case 'input':
    case 'inbox':
      await organizeInput()
      break
    case 'archived':
      await showArchived()
      break
    case 'moc':
      await generateMoc(opts.area)
      break
    case 'orphans':
      await findOrphans()
      break
    case 'tags':
      await showTagStats(opts.path)
      break
    default:
      console.log(chalk.yellow('Unknown subcommand: ' + subcommand))
      console.log('Available: input, archived, moc, orphans, tags')
  }
}

async function organizeInput() {
  const inboxPath = getVaultPath(INBOX_DIR)
  let files: string[]
  try {
    files = await glob('*.md', { cwd: inboxPath })
  } catch {
    console.log(chalk.green('Input folder is empty or does not exist.'))
    return
  }

  if (files.length === 0) {
    console.log(chalk.green('Input folder is empty!'))
    return
  }

  console.log(chalk.bold(`Input: ${files.length} notes pending\n`))
  for (const file of files) {
    const raw = await readFile(join(inboxPath, file), 'utf-8')
    const { frontmatter, body } = parseNote(raw)
    const title = (frontmatter.title as string) || basename(file, '.md')
    const tags = (frontmatter.tags as string[]) || []
    const preview = body.slice(0, 100).replace(/\n/g, ' ')

    console.log(chalk.cyan(file))
    console.log(`  Title: ${chalk.bold(title)}`)
    console.log(`  Tags:  ${tags.length ? tags.join(', ') : chalk.dim('(none)')}`)
    console.log(`  ${chalk.dim(preview)}...`)
    console.log()
  }

  console.log(chalk.dim('Use "obsi distill" to process these notes'))
  console.log(chalk.dim('Use "obsi archive <file>" to archive without distilling'))
}

async function showArchived() {
  const archivedPath = getVaultPath(ARCHIVED_DIR)
  let files: string[]
  try {
    files = await glob('*.md', { cwd: archivedPath })
  } catch {
    console.log(chalk.yellow('Archived folder is empty or does not exist.'))
    return
  }

  if (files.length === 0) {
    console.log(chalk.green('No archived notes!'))
    return
  }

  console.log(chalk.bold(`Archived: ${files.length} notes\n`))
  for (const file of files.slice(0, 20)) {
    console.log(chalk.dim('  ' + file))
  }
  if (files.length > 20) {
    console.log(chalk.dim(`  ... and ${files.length - 20} more`))
  }
}

async function generateMoc(area?: string) {
  if (!area) {
    console.log(chalk.yellow('Specify an area: obsi organize moc --area "<area-name>"'))
    if (KNOWN_AREAS.length > 0) {
      console.log(`Available: ${KNOWN_AREAS.join(', ')}`)
    } else {
      console.log(chalk.dim('No areas configured in ~/.obsirc.json'))
    }
    return
  }

  const areaPath = getVaultPath(PARA.areas, area)
  let files: string[]
  try {
    files = await glob('**/*.md', { cwd: areaPath })
  } catch {
    console.log(chalk.red(`Area not found: ${area}`))
    return
  }

  // Collect all tags across notes
  const tagMap = new Map<string, string[]>()
  const untagged: string[] = []

  for (const file of files) {
    if (file.endsWith('_MOC.md')) continue // Skip existing MOC
    const raw = await readFile(join(areaPath, file), 'utf-8')
    const { frontmatter } = parseNote(raw)
    const title = (frontmatter.title as string) || basename(file, '.md')
    const tags = (frontmatter.tags as string[]) || []

    if (tags.length === 0) {
      untagged.push(title)
    } else {
      for (const tag of tags) {
        if (!tagMap.has(tag)) tagMap.set(tag, [])
        tagMap.get(tag)!.push(title)
      }
    }
  }

  // Build MOC content
  let moc = `# ${area}\n\n`

  if (tagMap.size > 0) {
    moc += `## 按标签\n\n`
    for (const [tag, notes] of [...tagMap.entries()].sort()) {
      moc += `### #${tag}\n`
      for (const note of notes.sort()) {
        moc += `- [[${note}]]\n`
      }
      moc += '\n'
    }
  }

  if (untagged.length > 0) {
    moc += `## 未分类\n\n`
    for (const note of untagged.sort()) {
      moc += `- [[${note}]]\n`
    }
    moc += '\n'
  }

  moc += `\n---\n*Updated: ${new Date().toISOString().slice(0, 10)}*\n`

  const mocPath = join(areaPath, `${area}_MOC.md`)
  await writeFile(mocPath, moc, 'utf-8')

  console.log(chalk.green(`MOC generated: `) + chalk.cyan(`${PARA.areas}/${area}/${area}_MOC.md`))
  console.log(`  ${tagMap.size} tags, ${files.length - 1} notes, ${untagged.length} untagged`)
}

async function findOrphans() {
  const files = await glob('**/*.md', { cwd: getVaultPath() })
  const orphans: string[] = []

  for (const file of files) {
    try {
      const raw = await readFile(getVaultPath(file), 'utf-8')
      const { frontmatter, body } = parseNote(raw)
      const tags = (frontmatter.tags as string[]) || []
      const hasLinks = body.includes('[[') || body.includes('](')

      if (tags.length === 0 && !hasLinks) {
        orphans.push(file)
      }
    } catch {
      // skip
    }
  }

  if (orphans.length === 0) {
    console.log(chalk.green('No orphan notes found!'))
    return
  }

  console.log(chalk.bold(`Found ${orphans.length} orphan notes (no tags, no links):\n`))
  for (const o of orphans.slice(0, 30)) {
    console.log(chalk.dim('  ' + o))
  }
  if (orphans.length > 30) {
    console.log(chalk.dim(`  ... and ${orphans.length - 30} more`))
  }
}

async function showTagStats(path?: string) {
  const searchPath = path ? getVaultPath(path) : getVaultPath()
  const files = await glob('**/*.md', { cwd: searchPath, absolute: true })
  const tagCount = new Map<string, number>()

  for (const file of files) {
    try {
      const raw = await readFile(file, 'utf-8')
      const { frontmatter } = parseNote(raw)
      const tags = (frontmatter.tags as string[]) || []
      for (const tag of tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      }
    } catch {
      // skip
    }
  }

  if (tagCount.size === 0) {
    console.log(chalk.yellow('No tags found.'))
    return
  }

  console.log(chalk.bold(`Tags in ${path || 'vault'}:\n`))
  const sorted = [...tagCount.entries()].sort((a, b) => b[1] - a[1])
  for (const [tag, count] of sorted) {
    console.log(`  ${chalk.cyan('#' + tag)} (${count})`)
  }
}
