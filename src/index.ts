#!/usr/bin/env node

import { Command } from 'commander'
import { noteCommand } from './commands/note.js'
import { dailyCommand } from './commands/daily.js'
import { searchCommand } from './commands/search.js'
import { collectCommand } from './commands/collect.js'
import { organizeCommand } from './commands/organize.js'
import { statusCommand } from './commands/status.js'

const program = new Command()

program
  .name('obsi')
  .description('Agent-powered CLI for Obsidian note management')
  .version('0.1.0')

program
  .command('note')
  .description('Create a new note in the vault')
  .argument('<title>', 'Note title')
  .option('-c, --content <text>', 'Note content')
  .option('-a, --area <name>', 'Target area (e.g. 技术与工具)')
  .option('-p, --project <name>', 'Target project')
  .option('-r, --resource <name>', 'Target resource folder')
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
  .command('collect')
  .description('Collect content from URL or text')
  .argument('[url]', 'URL to collect from')
  .option('--text <text>', 'Text content to collect')
  .option('--title <title>', 'Note title')
  .option('-a, --area <name>', 'Target area')
  .option('-r, --resource <name>', 'Target resource folder')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action(collectCommand)

program
  .command('organize')
  .description('Organize vault: inbox, moc, orphans, tags')
  .argument('<subcommand>', 'inbox | moc | orphans | tags')
  .option('-p, --path <path>', 'Target path for tags command')
  .option('-a, --area <name>', 'Area name for moc command')
  .action(organizeCommand)

program
  .command('status')
  .description('Show vault status')
  .action(statusCommand)

program.parse()
