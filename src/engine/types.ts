export interface NoteOptions {
  title: string
  content: string
  area?: string
  project?: string
  resource?: string
  inbox?: boolean
  distilled?: boolean
  tags?: string[]
  source?: 'claude-code' | 'web' | 'manual' | 'agent'
  type?: 'note' | 'research' | 'project' | 'daily' | 'moc'
}

export interface SearchOptions {
  area?: string
  tags?: string[]
  limit?: number
}

export interface SearchResult {
  path: string
  title: string
  snippet: string
}

export interface VaultStats {
  totalNotes: number
  inboxCount: number
  archivedCount: number
  lastModified: string
}

export interface ExecutionEngine {
  createNote(opts: NoteOptions): Promise<string>
  appendDaily(content: string, heading?: string): Promise<void>
  search(query: string, opts?: SearchOptions): Promise<SearchResult[]>
  readNote(path: string): Promise<{ frontmatter: Record<string, unknown>; body: string }>
  getStats(): Promise<VaultStats>
}
