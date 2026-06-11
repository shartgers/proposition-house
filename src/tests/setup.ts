import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.test.local for integration tests
try {
  readFileSync(join(process.cwd(), '.env.test.local'), 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    })
} catch {}
