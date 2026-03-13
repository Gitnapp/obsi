---
allowed-tools: Bash(obsi *), WebFetch
description: Collect and save web content or text to Obsidian vault
---

# /collect — Collect Content to Obsidian

Fetch, summarize, and save web content or text to the Obsidian vault.

## Instructions

1. If a URL is provided:
   - Use WebFetch to get the page content
   - Summarize the key points
   - Structure as markdown with Source, Key Points, and Notes sections
   - Save with `obsi note`
2. If text is provided:
   - Structure and organize the text
   - Save with `obsi collect --text`

## For URLs:

```bash
# After fetching and summarizing:
obsi note "<article title>" --content "<structured summary>" --resource "Collected" --tags "<tags>" --source web --type research
```

## For text:

```bash
obsi collect --text "<text>" --title "<title>" [--area "<area>"]
```

## Content template for collected notes:

```markdown
## Source

[Article Title](url)

## Key Points

- Point 1
- Point 2

## Notes

(additional context)
```
