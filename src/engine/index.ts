import type { ExecutionEngine } from './types.js'
import { isObsidianRunning, isObsidianCLIAvailable } from '../utils/detect.js'
import { ObsidianCLIEngine } from './obsidian-cli.js'
import { DirectFileEngine } from './direct-file.js'

let cachedEngine: ExecutionEngine | null = null

export async function getEngine(): Promise<ExecutionEngine> {
  if (cachedEngine) return cachedEngine

  const running = await isObsidianRunning()
  const cliAvailable = running && (await isObsidianCLIAvailable())

  cachedEngine = cliAvailable ? new ObsidianCLIEngine() : new DirectFileEngine()
  return cachedEngine
}

export function getEngineMode(): string {
  if (cachedEngine instanceof ObsidianCLIEngine) return 'obsidian-cli'
  return 'direct-file'
}

export type { ExecutionEngine, NoteOptions, SearchOptions, SearchResult, VaultStats } from './types.js'
