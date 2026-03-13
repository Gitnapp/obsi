import { homedir } from 'os'
import { join } from 'path'
import { existsSync } from 'fs'

export const VAULT_PATH = join(
  homedir(),
  'Library/CloudStorage/OneDrive-个人/Obsidian/Notee'
)

export const PARA = {
  resources: '1. Resources',
  projects: '2. Projects',
  areas: '3. Areas',
  archive: '4. Archive',
} as const

export const INBOX_DIR = 'Inbox'
export const TEMPLATES_DIR = join(PARA.archive, '_Templates')

// Known area subdirectories for keyword matching
export const KNOWN_AREAS = [
  '健康',
  '技术与工具',
  '财富',
  '阅读',
  '唱歌',
  '商业',
  '服饰',
  '英语与职业',
  '饮食',
  'TEM-8 英语专业八级',
  '考研',
] as const

export function getVaultPath(...segments: string[]): string {
  return join(VAULT_PATH, ...segments)
}

export function vaultExists(): boolean {
  return existsSync(VAULT_PATH)
}
