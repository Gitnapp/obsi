---
allowed-tools: Bash(obsi *)
description: Save conversation content or ideas as an Obsidian note
---

# /note — Save to Obsidian

Save content from the current conversation to the user's Obsidian vault following the Input → Distillation → Archival workflow.

## Instructions

1. If the user said `/note` with no arguments, ask what they want to save. If they say "last", summarize the key points from the recent conversation.
2. Generate a descriptive title for the note.
3. Identify relevant tags from the content.
4. **Default behavior: Save to input/ folder** (workflow-first design)
   - Use `obsi note "<title>" --content "<content>"` without area/project flags
   - This saves to the input/ folder for later distillation
5. **Only bypass input phase if:**
   - User explicitly requests direct distillation: use `--distilled` flag
   - User specifies a target area/project: use `--area` or `--project` flags
6. Run the command:

```bash
# Default: Save to input/ (recommended)
obsi note "<title>" --content "<content>" --tags "<tags>" --source claude-code

# Direct distillation (only if user requests)
obsi note "<title>" --content "<content>" --tags "<tags>" --distilled --source claude-code

# Specific area (only if user specifies)
obsi note "<title>" --content "<content>" --area "<area>" --source claude-code
```

7. Report the created file path to the user.

## Tips
- Default to input/ folder unless user explicitly requests otherwise
- For long content, write to a temp file first and use `--from-file`
- Use `--project` when the conversation is clearly about a specific project
- The content should be well-structured markdown, not raw conversation dump
- User can later run `obsi distill` to process input notes
