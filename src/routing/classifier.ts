import { join } from 'path'
import { KNOWN_AREAS, INBOX_DIR, PARA } from '../utils/config.js'

// Keyword → area mapping
const AREA_KEYWORDS: Record<string, string[]> = {
  '技术与工具': ['代码', '编程', 'code', 'cli', 'api', 'agent', 'mcp', 'obsidian', 'git', '开发', '部署', 'deploy', '工具', 'tool', '脚本', 'script', 'python', 'typescript', 'node', 'docker', 'linux', 'server', 'ssh', '自动化', 'automation'],
  '财富': ['投资', '理财', '股票', '基金', '财务', 'finance', '交易', 'trading', '收入', '支出', '预算', '加密', 'crypto', '保险'],
  '阅读': ['读书', '书评', '笔记', 'book', 'reading', '摘录', '作者'],
  '健康': ['健身', '运动', '锻炼', '饮食', '睡眠', '冥想', 'exercise', 'health', 'workout'],
  '商业': ['商业', '创业', '营销', 'business', 'marketing', '产品', 'product', '用户', '增长'],
  '英语与职业': ['英语', 'english', '面试', 'interview', '简历', 'resume', '职业', 'career', '求职'],
  '饮食': ['食谱', '烹饪', '菜谱', '料理', 'recipe', 'cooking'],
  '唱歌': ['唱歌', '音乐', '歌曲', 'music', 'singing', '声乐'],
}

export function classifyNote(title: string, content: string, tags?: string[]): string {
  const text = `${title} ${content} ${(tags ?? []).join(' ')}`.toLowerCase()

  // Score each area
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

  // Require at least 2 keyword matches for confidence
  if (bestScore >= 2 && KNOWN_AREAS.includes(bestArea)) {
    return join(PARA.areas, bestArea)
  }

  // Default to inbox
  return INBOX_DIR
}
