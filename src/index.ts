#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { noteCommand } from './commands/note.js'
import { dailyCommand } from './commands/daily.js'
import { searchCommand } from './commands/search.js'
import { organizeCommand } from './commands/organize.js'
import { statusCommand } from './commands/status.js'
import { distillCommand } from './commands/distill.js'
import { archiveCommand } from './commands/archive.js'

const program = new Command()

program
  .name('obsi')
  .description('Agent-powered CLI for Obsidian note management')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize obsi with your Obsidian vault path')
  .argument('[vault-path]', 'Path to Obsidian vault')
  .action(initCommand)

program
  .command('note')
  .description('Create a new note in the vault')
  .argument('<title>', 'Note title')
  .option('-c, --content <text>', 'Note content')
  .option('-a, --area <name>', 'Target area')
  .option('-p, --project <name>', 'Target project')
  .option('-r, --resource <name>', 'Target resource folder')
  .option('--inbox', 'Save directly to inbox (1-Input), no auto-classify')
  .option('--distilled', 'Auto-classify to distilled/ (bypass input phase)')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('--from-file <path>', 'Read content from file')
  .option('--from-stdin', 'Read content from stdin')
  .option('--source <source>', 'Source: claude-code, web, manual, agent')
  .option('--type <type>', 'Type: note, research, project')
  .action(noteCommand)

program
  .command('daily')
  .description('Append content to today\'s daily note')
  .argument('[text]', 'Text to append')
  .option('-c, --content <text>', 'Content to append')
  .option('-h, --heading <heading>', 'Heading to append under')
  .action(dailyCommand)

program
  .command('search')
  .description('Search the vault')
  .argument('<query>', 'Search query')
  .option('-a, --area <name>', 'Limit to area')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-l, --limit <n>', 'Max results', '20')
  .action(searchCommand)

program
  .command('organize')
  .description('Organize vault: input, archived, moc, orphans, tags')
  .argument('<subcommand>', 'input | archived | moc | orphans | tags')
  .option('-p, --path <path>', 'Target path for tags command')
  .option('-a, --area <name>', 'Area name for moc command')
  .action(organizeCommand)

program
  .command('status')
  .description('Show vault status')
  .action(statusCommand)

program
  .command('distill')
  .description('Distill notes from input/ to distilled/')
  .argument('[file]', 'Specific file to distill')
  .option('-a, --area <name>', 'Target area for distillation')
  .option('--auto', 'Auto-distill all input notes')
  .action(distillCommand)

program
  .command('archive')
  .description('Archive notes from input/ to archived/')
  .argument('[file]', 'Specific file to archive')
  .option('--all', 'Archive all input notes')
  .action(archiveCommand)

program.parse()
