import { readFile, writeFile, stat, appendFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename, relative } from 'path'
import { glob } from 'glob'
import type { ExecutionEngine, NoteOptions, SearchOptions, SearchResult, VaultStats } from './types.js'
import { DAILY_NOTES_DIR, getVaultPath, INBOX_DIR, PARA, ARCHIVED_DIR } from '../utils/config.js'
import { buildNoteContent, createFrontmatter, parseNote } from '../utils/frontmatter.js'
import { classifyNote } from '../routing/classifier.js'

export class DirectFileEngine implements ExecutionEngine {

  async createNote(opts: NoteOptions): Promise<string> {
    const targetDir = this.resolveTargetDir(opts)
    const fullDir = getVaultPath(targetDir)

    if (!existsSync(fullDir)) {
      await mkdir(fullDir, { recursive: true })
    }

    const fileName = sanitizeFilename(opts.title) + '.md'
    const filePath = join(fullDir, fileName)

    const frontmatter = createFrontmatter({
      title: opts.title,
      source: opts.source ?? 'agent',
      type: opts.type ?? 'note',
      tags: opts.tags ?? [],
      area: opts.area,
      project: opts.project,
      status: targetDir.startsWith(INBOX_DIR) ? 'inbox' : 'active',
    })

    const content = buildNoteContent(frontmatter, opts.content)
    await writeFile(filePath, content, 'utf-8')

    return relative(getVaultPath(), filePath)
  }

  async appendDaily(content: string, heading?: string): Promise<void> {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const dailyDir = getVaultPath(DAILY_NOTES_DIR)
    const dailyPath = join(dailyDir, `${dateStr}.md`)

    if (!existsSync(dailyDir)) {
      await mkdir(dailyDir, { recursive: true })
    }

    const block = heading
      ? `\n${heading}\n${content}\n`
      : `\n${content}\n`

    if (existsSync(dailyPath)) {
      await appendFile(dailyPath, block, 'utf-8')
    } else {
      // Create minimal daily note
      const frontmatter = createFrontmatter({
        title: dateStr,
        type: 'daily',
        source: 'agent',
      })
      const initial = buildNoteContent(frontmatter, block)
      await writeFile(dailyPath, initial, 'utf-8')
    }
  }

  async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
    const limit = opts?.limit ?? 20
    const searchPath = opts?.area
      ? getVaultPath(PARA.areas, opts.area)
      : getVaultPath()

    const files = await glob('**/*.md', { cwd: searchPath, absolute: true })
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()

    for (const file of files) {
      if (results.length >= limit) break
      try {
        const raw = await readFile(file, 'utf-8')
        const { frontmatter, body } = parseNote(raw)

        // Check tags filter
        if (opts?.tags?.length) {
          const noteTags = (frontmatter.tags as string[]) ?? []
          const hasTag = opts.tags.some(t => noteTags.includes(t))
          if (!hasTag) continue
        }

        const titleMatch = (frontmatter.title as string || '').toLowerCase().includes(queryLower)
        const bodyMatch = body.toLowerCase().includes(queryLower)

        if (titleMatch || bodyMatch) {
          const snippet = extractSnippet(body, queryLower)
          results.push({
            path: relative(getVaultPath(), file),
            title: (frontmatter.title as string) || basename(file, '.md'),
            snippet,
          })
        }
      } catch {
        // Skip unreadable files
      }
    }

    return results
  }

  async readNote(path: string): Promise<{ frontmatter: Record<string, unknown>; body: string }> {
    const fullPath = path.startsWith('/') ? path : getVaultPath(path)
    const raw = await readFile(fullPath, 'utf-8')
    const { frontmatter, body } = parseNote(raw)
    return { frontmatter: frontmatter as Record<string, unknown>, body }
  }

  async getStats(): Promise<VaultStats> {
    const files = await glob('**/*.md', { cwd: getVaultPath() })
    const inboxFiles = await glob('*.md', { cwd: getVaultPath(INBOX_DIR) }).catch(() => [])
    const archivedFiles = await glob('*.md', { cwd: getVaultPath(ARCHIVED_DIR) }).catch(() => [])

    let lastModified = ''
    try {
      let latestTime = 0
      const sample = files.slice(0, 50)
      for (const f of sample) {
        const s = await stat(getVaultPath(f))
        if (s.mtimeMs > latestTime) {
          latestTime = s.mtimeMs
          lastModified = timeAgo(s.mtime)
        }
      }
    } catch {
      lastModified = 'unknown'
    }

    return {
      totalNotes: files.length,
      inboxCount: inboxFiles.length,
      archivedCount: archivedFiles.length,
      lastModified,
    }
  }

  private resolveTargetDir(opts: NoteOptions): string {
    // Explicit inbox flag
    if (opts.inbox) return INBOX_DIR
    
    // Explicit targets (always distilled)
    if (opts.area) return join(PARA.areas, opts.area)
    if (opts.project) return join(PARA.projects, opts.project)
    if (opts.resource) return join(PARA.resources, opts.resource)

    // --distilled flag: use auto-classification
    if (opts.distilled) {
      const classified = classifyNote(opts.title, opts.content, opts.tags)
      return classified
    }

    // Default: input folder (AGENTS.md workflow)
    return INBOX_DIR
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSnippet(body: string, query: string): string {
  const idx = body.toLowerCase().indexOf(query)
  if (idx === -1) return body.slice(0, 100) + '...'
  const start = Math.max(0, idx - 40)
  const end = Math.min(body.length, idx + query.length + 60)
  return (start > 0 ? '...' : '') + body.slice(start, end) + (end < body.length ? '...' : '')
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
