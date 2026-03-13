import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { detectVaultStructure } from '../../src/utils/vault-structure.ts'

test('detectVaultStructure prefers existing new-style folders over stale config values', () => {
  const vaultPath = mkdtempSync(join(tmpdir(), 'obsi-vault-'))
  mkdirSync(join(vaultPath, '1-Input'))
  mkdirSync(join(vaultPath, '2-Distilled'))
  mkdirSync(join(vaultPath, 'Projects'))
  mkdirSync(join(vaultPath, '3-Archived'))
  mkdirSync(join(vaultPath, 'Periodic'))

  const structure = detectVaultStructure(vaultPath, {
    para: {
      resources: '1. Resources',
      projects: '2. Projects',
      areas: '3. Areas',
      archive: '4. Archive',
    },
    inbox: 'Inbox',
  })

  assert.equal(structure.resources, '1-Input')
  assert.equal(structure.projects, 'Projects')
  assert.equal(structure.areas, '2-Distilled')
  assert.equal(structure.archive, '3-Archived')
  assert.equal(structure.inbox, '1-Input')
  assert.equal(structure.dailyNotes, 'Periodic')
  assert.equal(structure.vaultName.length > 0, true)
})

test('detectVaultStructure keeps configured folders when they exist', () => {
  const vaultPath = mkdtempSync(join(tmpdir(), 'obsi-vault-'))
  mkdirSync(join(vaultPath, 'Inbox'))
  mkdirSync(join(vaultPath, '1. Resources'))
  mkdirSync(join(vaultPath, '2. Projects'))
  mkdirSync(join(vaultPath, '3. Areas'))
  mkdirSync(join(vaultPath, '4. Archive'))

  const structure = detectVaultStructure(vaultPath, {
    para: {
      resources: '1. Resources',
      projects: '2. Projects',
      areas: '3. Areas',
      archive: '4. Archive',
    },
    inbox: 'Inbox',
  })

  assert.equal(structure.resources, '1. Resources')
  assert.equal(structure.projects, '2. Projects')
  assert.equal(structure.areas, '3. Areas')
  assert.equal(structure.archive, '4. Archive')
  assert.equal(structure.inbox, 'Inbox')
  assert.equal(structure.dailyNotes, 'Periodic')
})
