import { execa } from 'execa'
import type { ExecutionEngine, NoteOptions, SearchOptions, SearchResult, VaultStats } from './types.js'
import { DirectFileEngine } from './direct-file.js'
import { VAULT_NAME } from '../utils/config.js'

// ObsidianCLIEngine delegates to the official `obsidian` CLI when available,
// falls back to DirectFileEngine for operations the CLI doesn't support well.
export class ObsidianCLIEngine implements ExecutionEngine {
  private fallback = new DirectFileEngine()

  private async obsidian(...args: string[]): Promise<string> {
    const { stdout } = await execa('obsidian', [`vault=${VAULT_NAME}`, ...args])
    return stdout
  }

  async createNote(opts: NoteOptions): Promise<string> {
    // Obsidian CLI `create` always writes to vault root and doesn't support
    // routing to subdirectories, so use DirectFileEngine which handles
    // PARA-based routing (area/project/resource/inbox) correctly.
    return this.fallback.createNote(opts)
  }

  async appendDaily(content: string, heading?: string): Promise<void> {
    try {
      const text = heading ? `${heading}\n${content}` : content
      await this.obsidian('daily:append', `content=${text}`, 'open=false')
    } catch {
      await this.fallback.appendDaily(content, heading)
    }
  }

  async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
    try {
      const args = ['search', `query=${query}`]
      if (opts?.limit) args.push(`limit=${opts.limit}`)
      const stdout = await this.obsidian(...args)

      // Parse obsidian CLI search output
      const results: SearchResult[] = []
      const lines = stdout.split('\n').filter(l => l.trim())
      for (const line of lines) {
        results.push({
          path: line.trim(),
          title: line.trim().replace(/\.md$/, ''),
          snippet: '',
        })
      }
      return results
    } catch {
      return this.fallback.search(query, opts)
    }
  }

  async readNote(path: string): Promise<{ frontmatter: Record<string, unknown>; body: string }> {
    return this.fallback.readNote(path)
  }

  async getStats(): Promise<VaultStats> {
    return this.fallback.getStats()
  }
}
