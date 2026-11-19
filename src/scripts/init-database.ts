#!/usr/bin/env tsx

/**
 * Database Initialization Script
 * 
 * This script initializes the Firestore database with sample data.
 * Run this script to set up your e-commerce database.
 * 
 * Usage:
 * npx tsx src/scripts/init-database.ts
 */

import { initializeDatabase } from '../lib/database-init'

async function main() {
  console.log('🚀 Starting database initialization...')
  
  try {
    await initializeDatabase()
    console.log('✅ Database initialization completed successfully!')
    console.log('🎉 Your e-commerce database is ready!')
    console.log('')
    console.log('📊 What was created:')
    console.log('   • 5 sample products with images and details')
    console.log('   • 5 product categories')
    console.log('   • Database collections: products, categories, orders, users')
    console.log('')
    console.log('🌐 Next steps:')
    console.log('   1. Visit http://localhost:3000/products to see your products')
    console.log('   2. Visit http://localhost:3000/en/admin to manage your store')
    console.log('   3. Sign up for an account to test the full experience')
    console.log('')
    console.log('💡 Pro tip: You can run this script multiple times safely!')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

// Run the script
main()




