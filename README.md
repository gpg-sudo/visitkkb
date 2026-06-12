# VisitKKB - Tourism Platform for Kuala Kubu Bharu

A modern, database-driven tourism platform for Kuala Kubu Bharu (KKB), Malaysia. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🌟 Features

- **Database-Driven Content**: All stays, dining, and activities load from PostgreSQL (no hardcoded data)
- **Automated Data Ingestion**: Scrape places from Google Places API with admin review workflow
- **Secure Architecture**: Environment-based configuration, SSL database connections, server-side scraping
- **Admin Dashboard**: Manage bookings, operators, content, integrations, and scraped data
- **Responsive Design**: Mobile-first UI with modern aesthetics
- **SEO Optimized**: Server-side rendering, meta tags, structured data

## 🏗️ Architecture

```
External APIs (Google Places) 
    → Server-side Ingestion Scripts
    → ScrapedItem (admin review)
    → PostgreSQL Database (Stay, Restaurant, Activity)
    → Next.js API Routes
    → Frontend Pages (SSR)
    → User
```

**Stack:**
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Prisma ORM)
- **Hosting**: Vercel (frontend), Supabase/Neon/Railway (database)
- **APIs**: Google Places, Stripe, SendGrid, Twilio

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase, Neon, Railway, or local)
- Google Places API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd visit-kkb
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.template .env.local

# Edit .env.local and set:
# - DATABASE_URL (PostgreSQL connection string with SSL)
# - GOOGLE_PLACES_API_KEY (for data ingestion)
# - Other API keys as needed
```

### 3. Set Up Database

**Option A: Interactive Script (Recommended)**
```bash
./scripts/setup-database.sh
```

**Option B: Manual Steps**
```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# (Optional) Run data ingestion
npm run ingest:all

# Open Prisma Studio to inspect database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit:
- **Homepage**: http://localhost:3000
- **Stays**: http://localhost:3000/stays
- **Dining**: http://localhost:3000/dining
- **Dashboard**: http://localhost:3000/dashboard
- **Prisma Studio**: http://localhost:5555

## 🗄️ Database Schema

### Core Tables
- `User` - User accounts and profiles
- `Stay` - Accommodation listings
- `Restaurant` - Dining places
- `Activity` - Tours and activities
- `Booking` - Reservations
- `Payment` - Transaction records
- `Review` - User ratings and reviews

### Ingestion Layer
- `ScrapedSource` - Data source tracking
- `ScrapedItem` - Scraped data awaiting review
- `IngestionJob` - Job status and progress

### Admin & Content
- `Operator` - Activity/stay operators
- `Guide` - Tour guides
- `BlogPost` - Blog content
- `Event` - Community events
- `HistorySection` - Local history content

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run db:setup     # Generate + push (one command setup)
```

### Data Ingestion
```bash
npm run ingest:dining   # Scrape dining places from Google
npm run ingest:stays    # Scrape stays from Google
npm run ingest:all      # Run all ingestion scripts
```

## 🌐 API Endpoints

### Public
- `GET /api/stays` - List accommodation
- `GET /api/dining` - List restaurants
- `GET /api/activities` - List activities
- `GET /api/map/pins` - Get map markers

### Scraped Content (Admin)
- `GET /api/scraped-items` - List scraped items
- `PATCH /api/scraped-items` - Update item status
- `POST /api/scraped-items/import-stay` - Import stay
- `POST /api/scraped-items/import-dining` - Import restaurant

### Bookings & Admin
- `POST /api/bookings` - Create booking
- `GET /api/operator/dashboard` - Operator metrics
- `GET /api/integrations` - List integrations
- See full API documentation in code

## 🔐 Security

- ✅ Environment variables for all secrets
- ✅ SSL database connections in production
- ✅ Server-side data ingestion (no API keys in browser)
- ✅ Admin authentication and authorization
- ✅ Rate limiting on API endpoints
- ✅ Input validation with Zod

## 📦 Project Structure

```
visit-kkb/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (main)/       # Public pages
│   │   ├── (backend)/    # Admin dashboard
│   │   └── api/          # API routes
│   ├── components/       # React components
│   └── lib/              # Utilities and helpers
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # Data ingestion & setup scripts
├── public/               # Static assets
└── docs/                 # Additional documentation
```

## 🚢 Deployment

### Database (Choose One)
- **Supabase**: https://supabase.com (Recommended)
- **Neon**: https://neon.tech (Serverless)
- **Railway**: https://railway.app (Simple)
- **AWS RDS**: For enterprise scale

### Frontend
Deploy to Vercel (recommended):
```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_PLACES_API_KEY`
- Other API keys

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

[Add your license here]

## 🙋 Support

For issues and questions:
- Open an issue on GitHub
- Check the issues tab for known problems

---

**Built with ❤️ for Kuala Kubu Bharu**
# visitkkb
