---
allowed-tools: Bash(obsi *)
description: Organize Obsidian vault - process input, show archived, generate MOC, find orphans
---

# /organize — Organize Obsidian Vault

Help organize the Obsidian vault following the Input → Distillation → Archival workflow.

## Instructions

1. Ask the user which operation they want, or infer from context:
   - **input** — Review pending notes in the input folder
   - **archived** — Show archived notes
   - **moc** — Generate/update Map of Content for an area
   - **orphans** — Find notes with no tags or links
   - **tags** — Show tag statistics

2. Run the appropriate command:

```bash
obsi organize input
obsi organize archived
obsi organize moc --area "<area name>"
obsi organize orphans
obsi organize tags [--path "<path>"]
```

3. For input processing:
   - Show the list of pending notes
   - Suggest using `obsi distill` to process them
   - Or help user distill specific notes with `obsi distill "<file>" --area "<area>"`

4. For archived notes:
   - Show the list of archived notes
   - These are processed inputs that have been distilled

## Workflow Commands

Remind users of the full workflow:
- `obsi organize input` — Review pending inputs
- `obsi distill` — Process inputs to distilled
- `obsi organize archived` — View archived notes
