import { existsSync } from 'fs'
import { basename, join } from 'path'

export interface VaultConfigLike {
  para?: {
    resources?: string
    projects?: string
    areas?: string
    archive?: string
  }
  inbox?: string
  daily?: string
}

export interface VaultStructure {
  resources: string
  projects: string
  areas: string
  archive: string
  inbox: string
  dailyNotes: string
  vaultName: string
}

export function detectVaultStructure(vaultPath: string, config?: VaultConfigLike): VaultStructure {
  return {
    resources: pickExistingDir(vaultPath, [config?.para?.resources, '1-Input', '1. Resources'], '1. Resources'),
    projects: pickExistingDir(vaultPath, [config?.para?.projects, 'Projects', '2. Projects'], '2. Projects'),
    areas: pickExistingDir(vaultPath, [config?.para?.areas, '2-Distilled', '3. Areas'], '3. Areas'),
    archive: pickExistingDir(vaultPath, [config?.para?.archive, '3-Archived', '4. Archive'], '4. Archive'),
    inbox: pickExistingDir(vaultPath, [config?.inbox, '1-Input', 'Inbox'], 'Inbox'),
    dailyNotes: pickExistingDir(vaultPath, [config?.daily, 'Periodic'], 'Periodic'),
    vaultName: basename(vaultPath) || 'Obsidian',
  }
}

function pickExistingDir(vaultPath: string, candidates: Array<string | undefined>, fallback: string): string {
  const unique = [...new Set(candidates.filter(Boolean))] as string[]
  for (const candidate of unique) {
    if (existsSync(join(vaultPath, candidate))) {
      return candidate
    }
  }
  return unique[0] ?? fallback
}
