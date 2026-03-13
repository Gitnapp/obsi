---
name: note
description: Save conversation content or ideas as an Obsidian note. Use when user wants to save discussion results, code solutions, research findings, or any content to their Obsidian vault.
user_invocable: true
---

# /note — Save to Obsidian

Save content from the current conversation to the user's Obsidian vault.

## Process

1. Ask the user what to save (or use "last" to auto-extract from recent conversation)
2. Determine the best title and classification
3. Call `obsi note` CLI to create the note

## Steps

### If user says "last" or wants to save recent discussion:
- Summarize the key points from the recent conversation
- Generate a descriptive title
- Identify relevant tags from the content

### If user provides specific content:
- Use the provided content directly

### Create the note:

```bash
obsi note "<title>" --content "<content>" --tags "<tags>" [--area "<area>"] [--project "<project>"]
```

### Classification hints:
- Technical discussions → `--area "技术与工具"`
- Finance/investment → `--area "财富"`
- Book/reading notes → `--area "阅读"`
- Health/fitness → `--area "健康"`
- Business/marketing → `--area "商业"`
- If unsure, omit the area flag (auto-classifier will handle it)

### After creation:
- Report the file path to the user
- Mention which engine was used (obsidian-cli or direct-file)
