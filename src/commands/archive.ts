import chalk from 'chalk'
import { rename, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename } from 'path'
import { glob } from 'glob'
import { getVaultPath, INBOX_DIR, ARCHIVED_DIR } from '../utils/config.js'

interface ArchiveCommandOptions {
  all?: boolean
}

export async function archiveCommand(filePath?: string, opts?: ArchiveCommandOptions) {
  if (opts?.all) {
    await archiveAll()
  } else if (filePath) {
    await archiveSingleFile(filePath)
  } else {
    console.log(chalk.yellow('Specify a file to archive or use --all'))
    console.log(chalk.dim('Usage: obsi archive <file>'))
    console.log(chalk.dim('       obsi archive --all'))
  }
}

async function archiveSingleFile(inputPath: string) {
  const fullPath = inputPath.startsWith('/') ? inputPath : getVaultPath(inputPath)
  
  if (!existsSync(fullPath)) {
    console.log(chalk.red(`File not found: ${inputPath}`))
    process.exit(1)
  }

  const archivedDir = getVaultPath(ARCHIVED_DIR)
  if (!existsSync(archivedDir)) {
    await mkdir(archivedDir, { recursive: true })
  }

  const fileName = basename(inputPath)
  const archivedPath = join(archivedDir, fileName)

  await rename(fullPath, archivedPath)
  console.log(chalk.green('Archived: ') + chalk.cyan(ARCHIVED_DIR + '/' + fileName))
}

async function archiveAll() {
  const inboxPath = getVaultPath(INBOX_DIR)
  let files: string[]
  
  try {
    files = await glob('*.md', { cwd: inboxPath })
  } catch {
    console.log(chalk.yellow('No input folder or no files to archive.'))
    return
  }

  if (files.length === 0) {
    console.log(chalk.green('No files to archive!'))
    return
  }

  console.log(chalk.bold(`Found ${files.length} files in input folder`))
  console.log(chalk.yellow('⚠ This will archive ALL files. Continue? (y/N)'))

  process.stdin.setEncoding('utf-8')
  process.stdin.once('data', async (data) => {
    const answer = data.toString().trim().toLowerCase()
    if (answer === 'y' || answer === 'yes') {
      await performBatchArchive(files)
    } else {
      console.log(chalk.dim('Cancelled.'))
    }
    process.exit(0)
  })
}

async function performBatchArchive(files: string[]) {
  const archivedDir = getVaultPath(ARCHIVED_DIR)
  if (!existsSync(archivedDir)) {
    await mkdir(archivedDir, { recursive: true })
  }

  let archived = 0
  let failed = 0

  for (const file of files) {
    try {
      const fullPath = getVaultPath(INBOX_DIR, file)
      const archivedPath = join(archivedDir, file)
      await rename(fullPath, archivedPath)
      archived++
    } catch (err) {
      console.log(chalk.red(`Failed to archive ${file}: ${err}`))
      failed++
    }
  }

  console.log()
  console.log(chalk.green(`✓ Archived: ${archived}`))
  if (failed > 0) {
    console.log(chalk.red(`✗ Failed: ${failed}`))
  }
}
