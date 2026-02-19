#!/usr/bin/env node
/**
 * Verify DATABASE_URL format and connection.
 * Run: node scripts/verify-db.js
 * Or: DATABASE_URL="your_url" node scripts/verify-db.js
 */

const fs = require('fs')
const path = require('path')

// Load .env manually
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^DATABASE_URL=(.+)$/)
    if (match && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = match[1].replace(/^["']|["']$/g, '').trim()
    }
  })
}

const url = process.env.DATABASE_URL

console.log('🔍 Verifying DATABASE_URL...\n')

if (!url) {
  console.error('❌ DATABASE_URL is not set')
  console.log('   Add it to .env or run: DATABASE_URL="your_url" node scripts/verify-db.js')
  process.exit(1)
}

// Check format
if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://')
  console.log('   Current start:', url.substring(0, 30) + '...')
  process.exit(1)
}

// Mask password for display
const masked = url.replace(/:([^:@]+)@/, ':****@')
console.log('✅ Format OK')
console.log('   URL (masked):', masked)
console.log('   Length:', url.length, 'characters\n')

// Test with Prisma migrate status (lightweight connection check)
console.log('Testing connection...')
const { execSync } = require('child_process')
try {
  execSync('npx prisma migrate status', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: url }
  })
  console.log('✅ Connection successful!')
} catch (err) {
  console.error('❌ Connection failed:', err.stderr?.toString() || err.message)
  console.log('\nCommon issues:')
  console.log('  - Special chars in password: @ → %40, # → %23, & → %26')
  console.log('  - Wrong host/database name')
  console.log('  - Neon project paused (free tier - wake it in Neon dashboard)')
  console.log('  - Copy fresh URL from Neon: Connection Details > Connection string')
  process.exit(1)
}
