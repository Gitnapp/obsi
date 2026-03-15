---
allowed-tools: Bash(obsi *)
description: Distill notes from input/ to distilled/ folder
---

# /distill — Distill Input Notes

Process notes from the input/ folder to distilled/ folder, following the Input → Distillation → Archival workflow.

## Instructions

1. Ask the user which mode they want:
   - **Interactive** — Review all pending inputs with suggestions
   - **Auto** — Batch process all inputs with auto-classification
   - **Single file** — Distill a specific note

2. Run the appropriate command:

```bash
# Interactive mode (default)
obsi distill

# Auto-distill all inputs
obsi distill --auto

# Distill specific file
obsi distill "input/<filename>.md"

# Distill to specific area
obsi distill "input/<filename>.md" --area "<area>"
```

3. Explain the workflow:
   - Reads note from input/
   - Creates refined note in distilled/ with proper classification
   - Moves original to archived/ (if autoArchive is enabled)

4. After distillation, suggest:
   - `obsi status` to check workflow compliance
   - `obsi organize archived` to view archived notes

## Tips
- Interactive mode shows all pending inputs with suggested classifications
- Auto mode is useful for batch processing multiple notes
- Original notes are preserved in archived/ folder for reference
