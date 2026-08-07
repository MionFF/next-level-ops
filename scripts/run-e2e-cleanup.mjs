import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
const projectRoot = process.cwd()

loadEnvConfig(projectRoot)

const databaseUrl = process.env.E2E_DATABASE_URL?.trim()
const cleanupAllowed = process.env.E2E_ALLOW_REMOTE_CLEANUP === 'true'
const expectedProjectRef = process.env.E2E_CLEANUP_PROJECT_REF?.trim()
const cleanupScriptPath = resolve(projectRoot, 'scripts/cleanup-e2e-data.sql')

function fail(message) {
  console.error(`\nE2E cleanup aborted: ${message}\n`)
  process.exit(1)
}

if (!databaseUrl) {
  fail('E2E_DATABASE_URL is not configured.')
}

if (!cleanupAllowed) {
  fail(
    'Remote cleanup is disabled. Set E2E_ALLOW_REMOTE_CLEANUP=true only for the dedicated non-production E2E database.',
  )
}

if (!expectedProjectRef) {
  fail('E2E_CLEANUP_PROJECT_REF is not configured.')
}

let parsedDatabaseUrl

try {
  parsedDatabaseUrl = new URL(databaseUrl)
} catch {
  fail('E2E_DATABASE_URL is not a valid URL.')
}

if (!['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol)) {
  fail('E2E_DATABASE_URL must use the postgres:// or postgresql:// protocol.')
}

if (!existsSync(cleanupScriptPath)) {
  fail(`Cleanup SQL file was not found at ${cleanupScriptPath}.`)
}

const hostnameParts = parsedDatabaseUrl.hostname.split('.')

const directProjectRef = hostnameParts[0] === 'db' ? hostnameParts[1] : null

const poolerProjectRef = parsedDatabaseUrl.username.startsWith('postgres.')
  ? parsedDatabaseUrl.username.slice('postgres.'.length)
  : null

const actualProjectRef = directProjectRef ?? poolerProjectRef

if (!actualProjectRef) {
  fail('Could not determine the Supabase project ref from E2E_DATABASE_URL.')
}

if (actualProjectRef !== expectedProjectRef) {
  fail(
    `Database project mismatch. Expected "${expectedProjectRef}", received "${actualProjectRef}".`,
  )
}

const databaseTarget = [
  parsedDatabaseUrl.hostname,
  parsedDatabaseUrl.port || 'default port',
  parsedDatabaseUrl.pathname.replace(/^\//, '') || 'default database',
].join(' / ')

console.log(`\nE2E cleanup target: ${databaseTarget}`)
console.log(`Verified Supabase project: ${actualProjectRef}`)
console.log('Running scripts/cleanup-e2e-data.sql...\n')

const result = spawnSync(
  'psql',
  [databaseUrl, '--set', 'ON_ERROR_STOP=1', '--file', cleanupScriptPath],
  {
    cwd: projectRoot,
    stdio: 'inherit',
  },
)

if (result.error) {
  if (result.error.code === 'ENOENT') {
    fail('psql is not installed or is not available in PATH.')
  }

  fail(`Failed to start psql: ${result.error.message}`)
}

if (result.status !== 0) {
  fail(`Cleanup SQL failed with exit code ${result.status ?? 'unknown'}.`)
}

console.log('\nE2E cleanup completed successfully.\n')
