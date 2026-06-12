import { readFileSync } from 'fs'
import { join } from 'path'

function loadEnvFile(filename: string) {
  try {
    readFileSync(join(process.cwd(), filename), 'utf-8')
      .split(/\r?\n/)
      .forEach((line) => {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
      })
  } catch {}
}

// Load .env.local first (NEXT_PUBLIC_* vars), then .env.test.local overrides
loadEnvFile('.env.local')
loadEnvFile('.env.test.local')
