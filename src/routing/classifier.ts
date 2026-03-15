import { join } from 'path'
import { KNOWN_AREAS, INBOX_DIR, PARA } from '../utils/config.js'

function buildAreaKeywords(): Record<string, string[]> {
  const keywords: Record<string, string[]> = {}
  
  for (const area of KNOWN_AREAS) {
    keywords[area] = []
  }
  
  return keywords
}

const AREA_KEYWORDS = buildAreaKeywords()

export function classifyNote(title: string, content: string, tags?: string[]): string {
  const text = `${title} ${content} ${(tags ?? []).join(' ')}`.toLowerCase()

  let bestArea = ''
  let bestScore = 0

  for (const [area, keywords] of Object.entries(AREA_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestArea = area
    }
  }

  if (bestScore >= 2 && KNOWN_AREAS.includes(bestArea)) {
    return join(PARA.areas, bestArea)
  }

  return INBOX_DIR
}
