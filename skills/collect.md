---
name: collect
description: Collect and save content from a URL or text to Obsidian. Use when user wants to save web content, articles, or reference material to their vault.
user_invocable: true
---

# /collect — Collect Content to Obsidian

Fetch, summarize, and save web content or text to the Obsidian vault.

## Process

1. If a URL is provided, use WebFetch to get the content first
2. Summarize and structure the content as a note
3. Call `obsi collect` or `obsi note` to save

## For URLs:

```bash
# Step 1: Fetch the content using WebFetch tool
# Step 2: Summarize key points
# Step 3: Save with obsi
obsi note "<article title>" --content "<structured summary>" --resource "Collected" --tags "<auto-tags>" --source web --type research
```

## For text:

```bash
obsi collect --text "<user provided text>" --title "<title>" [--area "<area>"]
```

## Content structure for collected notes:

```markdown
## Source

[Article Title](url)

## Key Points

- Point 1
- Point 2

## Notes

User's additional context or thoughts
```

## After collection:
- Report what was saved and where
- Suggest relevant tags if none were provided
