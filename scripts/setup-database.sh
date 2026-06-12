#!/bin/bash

# VisitKKB - Database & Ingestion Quick Start Script
# This script sets up the database and runs initial data ingestion

set -e  # Exit on error

echo "========================================="
echo "  VisitKKB Database Setup & Ingestion   "
echo "========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo ""
    echo "Please create .env.local from env.template:"
    echo "  cp env.template .env.local"
    echo ""
    echo "Then edit .env.local and set:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - GOOGLE_PLACES_API_KEY (your Google API key)"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env.local; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    echo ""
    echo "Please add your PostgreSQL connection string to .env.local:"
    echo "  DATABASE_URL=\"postgresql://user:password@host:5432/database?sslmode=require\""
    echo ""
    exit 1
fi

echo "✓ Environment file found"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1/4: Generating Prisma Client..."
npm run db:generate

echo ""
echo "✓ Prisma Client generated"
echo ""

# Step 2: Push schema to database
echo "🗄️  Step 2/4: Pushing schema to PostgreSQL..."
echo ""
echo "⚠️  This will create/update tables in your database."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted by user"
    exit 1
fi

npm run db:push

echo ""
echo "✓ Database schema created/updated"
echo ""

# Step 3: Ask about data ingestion
echo "🌐 Step 3/4: Data Ingestion (Optional)"
echo ""
echo "This will fetch dining and stay data from Google Places API."
echo "Data will be stored in ScrapedItem table for review before publishing."
echo ""
read -p "Run data ingestion now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Fetching dining places from Google Places..."
    npm run ingest:dining || echo "Warning: Some errors occurred during dining ingestion"
    
    echo ""
    echo "Fetching accommodation places from Google Places..."
    npm run ingest:stays || echo "Warning: Some errors occurred during stays ingestion"
    
    echo ""
    echo "✓ Data ingestion complete"
else
    echo "Skipping data ingestion"
    echo "You can run it later with: npm run ingest:all"
fi

echo ""
echo "🎨 Step 4/4: Opening Prisma Studio..."
echo ""
echo "Prisma Studio will open in your browser at http://localhost:5555"
echo "Use it to inspect your database and manage data."
echo ""
read -p "Open Prisma Studio? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting Prisma Studio..."
    echo "Press Ctrl+C to exit when done"
    echo ""
    npm run db:studio
else
    echo "Skipping Prisma Studio"
    echo "You can open it later with: npm run db:studio"
fi

echo ""
echo "========================================="
echo "  ✅ Setup Complete!                    "
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Review scraped data (if you ran ingestion):"
echo "   - Open Prisma Studio: npm run db:studio"
echo "   - Navigate to ScrapedItem table"
echo ""
echo "2. Import scraped data:"
echo "   Use API endpoints:"
echo "   - GET /api/scraped-items?category=DINING&status=NEW"
echo "   - POST /api/scraped-items/import-dining"
echo "   - POST /api/scraped-items/import-stay"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Visit your site:"
echo "   - Stays: http://localhost:3000/stays"
echo "   - Dining: http://localhost:3000/dining"
echo "   - Dashboard: http://localhost:3000/dashboard"
echo ""
echo "📚 Full documentation:"
echo "   - DATABASE_AND_SCRAPING_SETUP.md"
echo "   - DATABASE_MIGRATION_COMPLETE.md"
echo ""
