import { homedir } from 'os'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { detectVaultStructure } from './vault-structure.js'

const RC_PATH = join(homedir(), '.obsirc.json')

interface ObsiConfig {
  vaultPath: string
  para?: {
    resources?: string
    projects?: string
    areas?: string
    archive?: string
  }
  inbox?: string
  daily?: string
  knownAreas?: string[]
}

function loadConfig(): ObsiConfig | null {
  if (!existsSync(RC_PATH)) return null
  try {
    return JSON.parse(readFileSync(RC_PATH, 'utf-8'))
  } catch {
    return null
  }
}

export function saveConfig(config: ObsiConfig): void {
  writeFileSync(RC_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export function configExists(): boolean {
  return existsSync(RC_PATH)
}

const config = loadConfig()
const structure = detectVaultStructure(config?.vaultPath ?? '', config ?? undefined)

export const VAULT_PATH = config?.vaultPath ?? ''
export const VAULT_NAME = structure.vaultName

export const PARA = {
  resources: structure.resources,
  projects: structure.projects,
  areas: structure.areas,
  archive: structure.archive,
} as const

export const INBOX_DIR = structure.inbox
export const DAILY_NOTES_DIR = structure.dailyNotes
export const TEMPLATES_DIR = join(PARA.archive, '_Templates')

export const KNOWN_AREAS: readonly string[] = config?.knownAreas ?? [
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
]

export function getVaultPath(...segments: string[]): string {
  return join(VAULT_PATH, ...segments)
}

export function vaultExists(): boolean {
  return VAULT_PATH !== '' && existsSync(VAULT_PATH)
}

export { RC_PATH }
