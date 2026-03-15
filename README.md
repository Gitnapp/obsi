# obsi

Agent-powered CLI for Obsidian note management following the **Input → Distillation → Archival** workflow.

## Workflow Philosophy

obsi enforces a three-phase knowledge management workflow:

1. **Input Phase** — All raw materials go into `input/` folder (flat structure, no subfolders)
2. **Distillation Phase** — Extract insights and create refined notes in `distilled/`
3. **Archival Phase** — Move processed inputs to `archived/` for reference

This workflow prevents clutter, maintains organization, and ensures sustainable knowledge management over time.

## Features

- **Workflow-first design** — Enforces Input → Distillation → Archival by default
- **Hybrid engine** — Uses Obsidian official CLI when running, falls back to direct file operations when not
- **Smart classification** — Auto-classifies notes based on content when distilling
- **Agent-friendly** — JSON-compatible output, stdin support, designed for AI agent workflows
- **Claude Code integration** — Ships as a Claude Code plugin with `/obsi:note`, `/obsi:distill` slash commands

## Install

```bash
git clone https://github.com/Gitnapp/obsi.git
cd obsi
npm install
npm run build
npm link
```

### Initialize

```bash
obsi init
```

Auto-detects Obsidian vaults on your machine and saves the config to `~/.obsirc.json`.

To specify a vault path manually:

```bash
obsi init /path/to/your/vault
```

### Claude Code Plugin

Add to your `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "obsi-plugins": {
      "source": {
        "source": "github",
        "repo": "Gitnapp/obsi"
      }
    }
  },
  "enabledPlugins": {
    "obsi@obsi-plugins": true
  }
}
```

Restart Claude Code. You'll get `/obsi:note`, `/obsi:organize` commands.

## Commands

### `obsi init`

Configure vault location.

```bash
obsi init                        # Auto-detect vault
obsi init /path/to/vault         # Manual path
```

Config is stored in `~/.obsirc.json`:

```json
{
  "vaultPath": "/path/to/vault",
  "para": {
    "resources": "1-Input",
    "projects": "Projects",
    "areas": "2-Distilled",
    "archive": "3-Archived"
  },
  "inbox": "1-Input",
  "daily": "Periodic",
  "knownAreas": [],
  "workflow": {
    "enforceInputFirst": true,
    "autoArchive": true
  }
}
```

**Workflow Configuration:**
- `enforceInputFirst` — When `true`, all notes go to `input/` by default (recommended)
- `autoArchive` — When `true`, automatically moves processed notes to `archived/` after distillation

`obsi init` inspects the target vault and writes the detected structure into config.

### `obsi note`

Create a new note in the vault. **By default, all notes go to `input/` folder** (workflow-first design).

```bash
# Default: Save to input/ folder (NEW BEHAVIOR)
obsi note "Docker Tutorial" --content "Learning docker compose..."
# → input/Docker Tutorial.md

# Bypass input phase with --distilled flag (auto-classify)
obsi note "Docker Tutorial" --content "..." --distilled
# → 2-Distilled/<auto-classified-area>/Docker Tutorial.md

# Specify target area directly (always distilled)
obsi note "Q1 Investment Review" --content "..." --area "Finance"
# → 2-Distilled/财富/Q1 投资复盘.md

# Target a project
obsi note "Auth Flow Design" --content "..." --project "MktGenie"
# → Projects/MktGenie/Auth Flow Design.md

# Save as resource
obsi note "REST API Cheatsheet" --content "..." --resource "Cheatsheets"
# → 1-Input/Cheatsheets/REST API Cheatsheet.md

# Read content from file
obsi note "Meeting Notes" --from-file ./meeting.md --area "商业"

# Pipe from stdin (useful for agents)
echo "Auto-generated content" | obsi note "Agent Output" --from-stdin
```

**Options:**

| Flag | Description |
|------|-------------|
| `-c, --content <text>` | Note body text |
| `-a, --area <name>` | Target area (always distilled) |
| `-p, --project <name>` | Target project (always distilled) |
| `-r, --resource <name>` | Target resource folder |
| `--distilled` | Auto-classify to distilled/ (bypass input phase) |
| `-t, --tags <tags>` | Comma-separated tags |
| `--from-file <path>` | Read content from a file |
| `--from-stdin` | Read content from stdin |
| `--source <source>` | Source label: `claude-code`, `web`, `manual`, `agent` |
| `--type <type>` | Note type: `note`, `research`, `project` |

### `obsi distill`

Process notes from `input/` folder to `distilled/` folder.

```bash
# Interactive mode: Review pending inputs
obsi distill
# Shows all input notes with suggested classifications

# Auto-distill all input notes
obsi distill --auto
# Batch processes all notes with auto-classification

# Distill specific note
obsi distill "input/Docker Tutorial.md"
# → 2-Distilled/<auto-classified>/Docker Tutorial.md
# → Moves original to archived/

# Distill to specific area
obsi distill "input/Meeting Notes.md" --area "Business"
# → 2-Distilled/Business/Meeting Notes.md
```

**Workflow:**
1. Reads note from `input/`
2. Creates refined note in `distilled/` with proper classification
3. Moves original to `archived/` (if `autoArchive` is enabled)

### `obsi archive`

Manually archive notes from `input/` to `archived/`.

```bash
# Archive specific note
obsi archive "input/Old Notes.md"
# → archived/Old Notes.md

# Archive all input notes (with confirmation)
obsi archive --all
```

Use this when you want to archive notes without distilling them.

### `obsi daily`

Append content to today's daily note.

```bash
# Quick append
obsi daily "Finished obsi CLI development"

# With a heading
obsi daily --heading "## TODO" --content "- [ ] Write unit tests"

# Multi-line content
obsi daily --content "Key takeaway from today's meeting:
- Decision A was made
- Follow up on item B"
```

### `obsi search`

Search across the vault.

```bash
obsi search "agent workflow"
obsi search "投资" --area "财富" --limit 5
obsi search "docker" --tags "devops"
```

**Options:**

| Flag | Description |
|------|-------------|
| `-a, --area <name>` | Limit search to an area |
| `-t, --tags <tags>` | Filter by tags |
| `-l, --limit <n>` | Max results (default: 20) |

### `obsi organize`

Organize and maintain the vault.

```bash
# Review input notes pending distillation
obsi organize input

# Show archived notes
obsi organize archived

# Generate Map of Content for an area
obsi organize moc --area "Technology"

# Find orphan notes (no tags, no links)
obsi organize orphans

# Show tag statistics
obsi organize tags
obsi organize tags --path "2-Distilled/Technology"
```

### `obsi status`

Show vault status and workflow compliance.

```bash
obsi status
# obsi status
# ──────────────────────────────────────────────────
# Vault:     Notee (/Users/.../Obsidian/Notee)
# Obsidian:  running (CLI available)
# Engine:    obsidian-cli
# Notes:     773 total
# Workflow:  5 pending input | 120 archived
# Modified:  2h ago
```

## Note Routing

When no explicit `--area`, `--project`, or `--resource` flag is provided, obsi auto-classifies based on content keywords:

| Keywords detected | Target |
|-------------------|--------|
| code, cli, api, agent, docker, git... | detected areas folder, e.g. `2-Distilled/技术与工具/` |
| 投资, 股票, 基金, finance, trading... | detected areas folder, e.g. `2-Distilled/财富/` |
| 读书, book, reading, 书评... | detected areas folder, e.g. `2-Distilled/阅读/` |
| 健身, exercise, health, workout... | detected areas folder, e.g. `2-Distilled/健康/` |
| 商业, business, marketing, 创业... | detected areas folder, e.g. `2-Distilled/商业/` |
| No confident match | detected inbox folder, e.g. `1-Input/` + `#to-classify` tag |

Requires at least 2 keyword matches for classification confidence. This is intentionally conservative — better to land in Inbox than to be misclassified.

## Frontmatter

Notes created by obsi include YAML frontmatter:

```yaml
---
title: "Note Title"
created: 2026-03-13T14:30:00.000Z
modified: 2026-03-13T14:30:00.000Z
source: agent
type: note
tags:
  - cli
  - automation
status: active
---
```

## Hybrid Engine

obsi automatically selects the best execution engine:

| Condition | Engine | Capabilities |
|-----------|--------|-------------|
| Obsidian running + CLI enabled | `obsidian-cli` | Full: templates, search, daily notes via official CLI |
| Obsidian not running | `direct-file` | Core: file read/write, frontmatter, grep-based search |

Check the current engine with `obsi status`.

## Agent Integration

obsi is designed for AI agent workflows. All commands support stdin and produce clean output.

```python
# Python
import subprocess
result = subprocess.run(
    ['obsi', 'note', 'Title', '--content', 'Content'],
    capture_output=True, text=True
)
```

```typescript
// TypeScript
import { execa } from 'execa'
await execa('obsi', ['note', 'Title', '--content', 'Content'])
```

```bash
# Shell script
obsi daily --heading "## Agent Log" --content "Task completed at $(date)"
```

### Recommended Agent Workflow

```bash
# 1. Capture all raw inputs to input/ folder
obsi note "Research Finding" --content "..." --source agent

# 2. Let user review and distill manually, or
obsi distill --auto  # Batch process

# 3. Check workflow status
obsi status
```

```typescript
// TypeScript
import { execa } from 'execa'
await execa('obsi', ['note', 'Title', '--content', 'Content', '--area', '技术与工具'])
```

```bash
# Shell script
obsi daily --heading "## Agent Log" --content "Task completed at $(date)"
```

## Project Structure

```
obsi/
├── .claude-plugin/        # Claude Code plugin manifest
│   ├── plugin.json
│   └── marketplace.json
├── commands/              # Claude Code slash commands
│   ├── note.md            # /obsi:note
│   └── organize.md        # /obsi:organize
├── src/
│   ├── index.ts           # CLI entry point (Commander.js)
│   ├── commands/          # Command implementations
│   ├── engine/            # Hybrid execution engine
│   │   ├── types.ts       # ExecutionEngine interface
│   │   ├── obsidian-cli.ts
│   │   └── direct-file.ts
│   ├── routing/
│   │   └── classifier.ts  # Auto-classification logic
│   └── utils/
│       ├── config.ts      # ~/.obsirc.json management
│       ├── vault-structure.ts # Detect real vault folder layout
│       ├── frontmatter.ts # YAML frontmatter helpers
│       └── detect.ts      # Obsidian process detection
├── hooks/
│   └── stop-daily.sh      # Auto-append conversation summary on session end
└── skills/                # Claude Code skills (programmatic)
```

## License

MIT
