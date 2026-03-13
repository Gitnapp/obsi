---
allowed-tools: Bash(obsi *)
description: Organize Obsidian vault - process inbox, generate MOC, find orphans
---

# /organize — Organize Obsidian Vault

Help organize the Obsidian vault.

## Instructions

1. Ask the user which operation they want, or infer from context:
   - **inbox** — Process pending notes in Inbox
   - **moc** — Generate/update Map of Content for an area
   - **orphans** — Find notes with no tags or links
   - **tags** — Show tag statistics

2. Run the appropriate command:

```bash
obsi organize inbox
obsi organize moc --area "<area name>"
obsi organize orphans
obsi organize tags [--path "<path>"]
```

3. For inbox processing:
   - Show the list of pending notes
   - For each note, suggest a classification
   - Help the user move notes to the right location

## Available areas for MOC:
健康, 技术与工具, 财富, 阅读, 唱歌, 商业, 服饰, 英语与职业, 饮食
