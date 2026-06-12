import { chromium, FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'E2E setup requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars'
    )
  }

  const testEmail = process.env.E2E_TEST_EMAIL ?? 'e2e@xomnia-test.internal'

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Ensure test user exists (idempotent)
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const userExists = users.some((u) => u.email === testEmail)

  if (!userExists) {
    const { error } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
    })
    if (error) throw new Error(`Failed to create E2E test user: ${error.message}`)
  }

  // Generate a one-time magic link — no email is sent, we get the link directly
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: testEmail,
    options: { redirectTo: `${baseURL}/auth/callback` },
  })
  if (error || !data) throw new Error(`Failed to generate magic link: ${error?.message}`)

  const authDir = path.join(__dirname, '.auth')
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Follow the magic link: Supabase verifies → redirects to /auth/callback?code=xxx
  // The app's callback route exchanges the code and sets session cookies
  await page.goto(data.properties.action_link)
  await page.waitForURL(`${baseURL}/**`, { timeout: 20_000 })

  await context.storageState({ path: path.join(authDir, 'user.json') })
  await browser.close()
}
