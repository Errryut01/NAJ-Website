#!/usr/bin/env node
/**
 * Ensure DATABASE_URL is available for Prisma during Vercel build.
 * Vercel sometimes doesn't inject env vars correctly - this writes .env so Prisma can read it.
 */
const fs = require('fs')
const path = require('path')

// Load from .env if not in process.env (for local builds)
if (!process.env.DATABASE_URL && !process.env.PRISMA_DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const match = line.match(/^DATABASE_URL=(.+)$/)
      if (match) process.env.DATABASE_URL = match[1].replace(/^["']|["']$/g, '').trim()
    })
  }
}

const url = process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL
if (!url) {
  console.error('ERROR: Add DATABASE_URL (or PRISMA_DATABASE_URL) in Vercel: Settings > Environment Variables')
  console.error('Enable for: Production, Preview, Development')
  process.exit(1)
}
const envPath = path.join(__dirname, '..', '.env')
fs.writeFileSync(envPath, `DATABASE_URL="${url.replace(/"/g, '\\"')}"\n`)
console.log('DATABASE_URL configured for build')
