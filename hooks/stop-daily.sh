#!/bin/bash
# Claude Code Stop hook: append conversation summary to daily note
# This hook is triggered when a Claude Code session ends

# Check if obsi is available
if ! command -v obsi &> /dev/null; then
  exit 0
fi

# Read the transcript summary from stdin (provided by Claude Code)
SUMMARY=$(cat)

# Only append if there's meaningful content
if [ -z "$SUMMARY" ] || [ ${#SUMMARY} -lt 10 ]; then
  exit 0
fi

# Append to daily note under AI对话 heading
obsi daily --heading "## AI 对话记录" --content "- $(date '+%H:%M') $SUMMARY" 2>/dev/null

exit 0
