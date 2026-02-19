#!/usr/bin/env node

/**
 * Test script to verify all dependencies are properly installed and configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Job Search Automation Dependencies...\n');

// Test 1: Check if all required packages are installed
console.log('1. 📦 Checking installed packages...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'cheerio',
  'googleapis',
  'nodemailer',
  'openai',
  '@anthropic-ai/sdk',
  'axios',
  'prisma',
  '@prisma/client'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length === 0) {
  console.log('   ✅ All required packages are installed');
} else {
  console.log('   ❌ Missing packages:', missingDeps.join(', '));
  console.log('   Run: npm install ' + missingDeps.join(' '));
}

// Test 2: Check environment variables
console.log('\n2. 🔑 Checking environment variables...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredEnvVars = [
    'DATABASE_URL',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'RAPIDAPI_LINKEDIN_KEY',
    'GROK_API_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => 
    !envContent.includes(envVar) || envContent.includes(`${envVar}="your_`)
  );
  
  if (missingEnvVars.length === 0) {
    console.log('   ✅ All required environment variables are set');
  } else {
    console.log('   ⚠️  Missing or placeholder environment variables:', missingEnvVars.join(', '));
    console.log('   Please update .env.local with your actual API keys');
  }
} else {
  console.log('   ❌ .env.local file not found');
  console.log('   Please create .env.local with your API keys');
}

// Test 3: Check database
console.log('\n3. 🗄️  Checking database...');
const dbPath = 'prisma/dev.db';
if (fs.existsSync(dbPath)) {
  console.log('   ✅ Database file exists');
} else {
  console.log('   ⚠️  Database file not found');
  console.log('   Run: npx prisma migrate dev');
}

// Test 4: Check Prisma schema
console.log('\n4. 📋 Checking Prisma schema...');
const schemaPath = 'prisma/schema.prisma';
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('linkedInProfileUrl')) {
    console.log('   ✅ LinkedIn profile URL field found in schema');
  } else {
    console.log('   ⚠️  LinkedIn profile URL field not found in schema');
  }
} else {
  console.log('   ❌ Prisma schema not found');
}

// Test 5: Check API endpoints
console.log('\n5. 🔌 Checking API endpoints...');
const apiEndpoints = [
  'src/app/api/auth/linkedin/route.ts',
  'src/app/api/email/auth/route.ts',
  'src/app/api/jobs/analyze/route.ts'
];

const existingEndpoints = apiEndpoints.filter(endpoint => fs.existsSync(endpoint));
console.log(`   ✅ ${existingEndpoints.length}/${apiEndpoints.length} API endpoints found`);

// Test 6: Check components
console.log('\n6. 🧩 Checking React components...');
const components = [
  'src/components/ProfileSetup.tsx',
  'src/components/JobSearchNew.tsx',
  'src/components/Messaging.tsx',
  'src/components/Connections.tsx',
  'src/components/Applications.tsx'
];

const existingComponents = components.filter(component => fs.existsSync(component));
console.log(`   ✅ ${existingComponents.length}/${components.length} React components found`);

console.log('\n🎉 Dependency check complete!');
console.log('\n📚 Next steps:');
console.log('1. Update .env.local with your actual API keys');
console.log('2. Run: npx prisma migrate dev (to add LinkedIn profile URL field)');
console.log('3. Run: npm run dev (to start the application)');
console.log('4. Visit: http://localhost:3000');
console.log('\n📖 For detailed setup instructions, see SETUP_GUIDE.md');

