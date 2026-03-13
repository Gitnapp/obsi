import matter from 'gray-matter'

export interface NoteFrontmatter {
  title: string
  created: string
  modified: string
  source: 'claude-code' | 'web' | 'manual' | 'agent'
  type: 'note' | 'research' | 'project' | 'daily' | 'moc'
  tags: string[]
  area?: string
  project?: string
  status: 'active' | 'inbox'
}

export function createFrontmatter(
  overrides: Partial<NoteFrontmatter> & { title: string }
): NoteFrontmatter {
  const now = new Date().toISOString()
  return {
    created: now,
    modified: now,
    source: 'agent',
    type: 'note',
    tags: [],
    status: 'active',
    ...overrides,
  }
}

export function buildNoteContent(
  frontmatter: NoteFrontmatter,
  body: string
): string {
  // Remove undefined values that cause YAML serialization errors
  const clean = Object.fromEntries(
    Object.entries(frontmatter).filter(([, v]) => v !== undefined)
  )
  return matter.stringify(body, clean)
}

export function parseNote(content: string) {
  const { data, content: body } = matter(content)
  return { frontmatter: data as Partial<NoteFrontmatter>, body }
}
