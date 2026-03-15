import chalk from 'chalk'
import { readFile, writeFile, rename, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename } from 'path'
import { glob } from 'glob'
import { getVaultPath, INBOX_DIR, PARA, ARCHIVED_DIR, WORKFLOW_CONFIG } from '../utils/config.js'
import { parseNote, buildNoteContent, createFrontmatter } from '../utils/frontmatter.js'
import { classifyNote } from '../routing/classifier.js'

interface DistillCommandOptions {
  area?: string
  auto?: boolean
}

export async function distillCommand(filePath?: string, opts?: DistillCommandOptions) {
  if (filePath) {
    await distillSingleFile(filePath, opts?.area)
  } else if (opts?.auto) {
    await distillAuto()
  } else {
    await distillInteractive()
  }
}

async function distillSingleFile(inputPath: string, targetArea?: string) {
  const fullPath = inputPath.startsWith('/') ? inputPath : getVaultPath(inputPath)
  
  if (!existsSync(fullPath)) {
    console.log(chalk.red(`File not found: ${inputPath}`))
    process.exit(1)
  }

  const raw = await readFile(fullPath, 'utf-8')
  const { frontmatter, body } = parseNote(raw)
  const title = (frontmatter.title as string) || basename(inputPath, '.md')
  const tags = (frontmatter.tags as string[]) || []

  let targetDir: string
  if (targetArea) {
    targetDir = join(PARA.areas, targetArea)
  } else {
    targetDir = classifyNote(title, body, tags)
  }

  const distilledPath = getVaultPath(targetDir)
  if (!existsSync(distilledPath)) {
    await mkdir(distilledPath, { recursive: true })
  }

  const fileName = basename(inputPath)
  const newPath = join(distilledPath, fileName)

  const updatedFrontmatter = createFrontmatter({
    title,
    ...frontmatter,
    status: 'active',
  })
  const distilledContent = buildNoteContent(updatedFrontmatter, body)
  await writeFile(newPath, distilledContent, 'utf-8')

  if (WORKFLOW_CONFIG.autoArchive) {
    const archivedDir = getVaultPath(ARCHIVED_DIR)
    if (!existsSync(archivedDir)) {
      await mkdir(archivedDir, { recursive: true })
    }
    const archivedPath = join(archivedDir, fileName)
    await rename(fullPath, archivedPath)
    console.log(chalk.green('Distilled: ') + chalk.cyan(targetDir + '/' + fileName))
    console.log(chalk.dim('Archived: ') + chalk.dim(ARCHIVED_DIR + '/' + fileName))
  } else {
    console.log(chalk.green('Distilled: ') + chalk.cyan(targetDir + '/' + fileName))
    console.log(chalk.yellow('Original remains in: ') + inputPath)
  }
}

async function distillAuto() {
  const inboxPath = getVaultPath(INBOX_DIR)
  let files: string[]
  
  try {
    files = await glob('*.md', { cwd: inboxPath })
  } catch {
    console.log(chalk.yellow('No input folder or no files to distill.'))
    return
  }

  if (files.length === 0) {
    console.log(chalk.green('No files to distill!'))
    return
  }

  console.log(chalk.bold(`Auto-distilling ${files.length} notes...\n`))

  let distilled = 0
  let failed = 0

  for (const file of files) {
    try {
      const fullPath = join(inboxPath, file)
      await distillSingleFile(fullPath)
      distilled++
    } catch (err) {
      console.log(chalk.red(`Failed to distill ${file}: ${err}`))
      failed++
    }
  }

  console.log()
  console.log(chalk.green(`✓ Distilled: ${distilled}`))
  if (failed > 0) {
    console.log(chalk.red(`✗ Failed: ${failed}`))
  }
}

async function distillInteractive() {
  const inboxPath = getVaultPath(INBOX_DIR)
  let files: string[]
  
  try {
    files = await glob('*.md', { cwd: inboxPath })
  } catch {
    console.log(chalk.yellow('No input folder or no files to distill.'))
    return
  }

  if (files.length === 0) {
    console.log(chalk.green('No files to distill!'))
    return
  }

  console.log(chalk.bold(`Found ${files.length} notes in input folder\n`))
  console.log(chalk.dim('Use "obsi distill <file> --area <area>" to distill specific notes'))
  console.log(chalk.dim('Use "obsi distill --auto" for batch auto-classification\n'))

  for (const file of files) {
    const fullPath = join(inboxPath, file)
    const raw = await readFile(fullPath, 'utf-8')
    const { frontmatter, body } = parseNote(raw)
    const title = (frontmatter.title as string) || basename(file, '.md')
    const tags = (frontmatter.tags as string[]) || []
    const preview = body.slice(0, 150).replace(/\n/g, ' ')

    console.log(chalk.cyan(file))
    console.log(`  Title: ${chalk.bold(title)}`)
    console.log(`  Tags:  ${tags.length ? tags.join(', ') : chalk.dim('(none)')}`)
    console.log(`  ${chalk.dim(preview)}...`)
    
    const suggested = classifyNote(title, body, tags)
    console.log(`  ${chalk.yellow('→ Suggested:')} ${suggested}`)
    console.log()
  }
}
