// Usage: node --env-file=.env scripts/import-variant.mjs scripts/data/variant1.mjs
import { runImport } from './lib/import-helpers.mjs'

const dataPath = process.argv[2]
if (!dataPath) {
  console.error('Usage: node --env-file=.env scripts/import-variant.mjs <path-to-data-file.mjs>')
  process.exit(1)
}

const { default: spec } = await import(new URL(dataPath, `file://${process.cwd()}/`))
await runImport(spec)
