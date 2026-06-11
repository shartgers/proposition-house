import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'

describe('proxy — route protection', () => {
  it('redirects unauthenticated request for / to /login', async () => {
    const req = new NextRequest('http://localhost:3000/')
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('allows unauthenticated request to /login through', async () => {
    const req = new NextRequest('http://localhost:3000/login')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })

  it('allows unauthenticated request to /auth/callback through', async () => {
    const req = new NextRequest('http://localhost:3000/auth/callback?code=abc')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })
})
