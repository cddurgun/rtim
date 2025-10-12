# RTIM - Vercel Deployment Guide

Complete guide for deploying RTIM to production with Vercel.

---

## 📋 Prerequisites

Before deploying, you'll need:

1. **Vercel Account** - [vercel.com](https://vercel.com)
2. **GitHub Account** - For code repository
3. **PostgreSQL Database** - Vercel Postgres, Supabase, or Neon
4. **OpenAI API Key** - [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## 🚀 Quick Deploy (5 Steps)

### Step 1: Prepare Your Repository

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: new landing page and Sora API integration"

# Create GitHub repository (if not exists)
gh repo create rtim --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `rtim`
4. Configure settings:
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `prisma generate && next build` (auto-configured)
   - **Output Directory**: `.next` (auto-configured)
5. Don't deploy yet - add environment variables first!

### Step 3: Configure Environment Variables

In Vercel project settings, add these variables:

#### ✅ REQUIRED (Minimum to Launch)

```bash
# Database - Get from Vercel Postgres or your provider
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth v5 - Authentication
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"
AUTH_URL="https://your-project.vercel.app"

# OpenAI - Sora API Access
OPENAI_API_KEY="sk-proj-..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
NEXT_PUBLIC_APP_NAME="RTIM"
DEFAULT_STARTER_CREDITS="100"
```

#### ⚙️ OPTIONAL (Enhanced Features)

```bash
# Feature Flags
ENABLE_PROMPT_ENHANCEMENT="true"
ENABLE_STYLE_PROFILES="true"
ENABLE_COLLABORATION="false"
ENABLE_API_ACCESS="false"

# Rate Limiting
RATE_LIMIT_PER_MINUTE="10"
RATE_LIMIT_PER_HOUR="100"
MAX_CONCURRENT_JOBS="5"

# Redis (for job queue - recommended for production)
REDIS_URL="redis://default:password@host:6379"

# OAuth Providers (for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### Step 4: Create Database

**Option A: Vercel Postgres (Easiest)**
1. In Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy `DATABASE_URL` (automatically added to env vars)

**Option B: Supabase (Free Tier)**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Use "Transaction" pooler mode
4. Add `?pgbouncer=true` to URL

**Option C: Neon (Serverless)**
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string from dashboard
3. Ensure `?sslmode=require` is in URL

### Step 5: Deploy & Migrate

1. Click "Deploy" in Vercel
2. Wait 3-5 minutes for build
3. Once deployed, run database migration:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run database migration
npx prisma db push

# Verify deployment
vercel open
```

---

## 🗄️ Database Actions Required

### What Happens During Deployment

1. **Prisma Generate** (Automatic)
   - Runs via `vercel.json` build command
   - Generates Prisma Client for your schema

2. **Database Tables Created** (Manual - Run Once)
   ```bash
   npx prisma db push
   ```

   This creates these tables:
   - ✅ `User` - User accounts, credits, subscriptions
   - ✅ `Account` - OAuth provider accounts
   - ✅ `Session` - User sessions
   - ✅ `Video` - Generated videos and metadata
   - ✅ `Transaction` - Credit purchases and usage logs
   - ✅ `Workspace` - Team workspaces (for collaboration)
   - ✅ `StyleProfile` - Saved style templates
   - ✅ `ApiKey` - API access keys (for developers)

3. **Seed Initial Data** (Optional)
   ```bash
   npx prisma db seed
   ```

### 4. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the DATABASE_URL to your environment variables

#### Option B: External PostgreSQL
Use any PostgreSQL provider:
- Supabase (free tier)
- Neon (serverless)
- Railway
- AWS RDS

### 5. Run Migrations

After deployment, run migrations:
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull

# Run migrations
npx prisma db push
```

### 6. Verify Deployment

1. Visit your Vercel URL
2. Sign up for an account
3. Try generating a video

## Post-Deployment Checklist

- [ ] Database connected and migrated
- [ ] OpenAI API key working
- [ ] Authentication working (test sign up/in)
- [ ] Video generation works
- [ ] Prompt enhancement active
- [ ] Credit system functional

## Troubleshooting

### "Module not found: @prisma/client"
```bash
vercel env pull
npm run db:generate
git add .
git commit -m "Add generated Prisma client"
git push
```

### "Unauthorized" errors
- Check NEXTAUTH_URL matches your deployed URL
- Verify NEXTAUTH_SECRET is set
- Check OAuth credentials if using Google/GitHub

### Video generation fails
- Verify OPENAI_API_KEY is correct
- Check API key has Sora access
- Review API quota/limits

### Database connection errors
- Verify DATABASE_URL format
- Check database is accessible from Vercel
- Ensure SSL mode if required

## Scaling Considerations

### For Production

1. **Database**: Upgrade to managed PostgreSQL with connection pooling
2. **Storage**: Set up AWS S3 or Cloudflare R2 for video storage
3. **Queue**: Add Redis for job queue (prevents timeout issues)
4. **Monitoring**: Add Sentry for error tracking
5. **Analytics**: Configure PostHog or similar

### Performance Optimization

- Enable Vercel Edge caching
- Use CDN for video delivery
- Implement webhook-based status updates (instead of polling)
- Add rate limiting middleware
- Consider separating video processing to background workers

## Cost Estimates

### Vercel
- **Hobby**: Free (good for testing)
- **Pro**: $20/month (recommended for production)

### Database
- **Vercel Postgres**: $20-100/month
- **Supabase**: Free-$25/month
- **Neon**: Pay-per-use

### OpenAI Sora
- **Sora-2**: ~$0.10-0.15/second
- **Sora-2 Pro**: ~$0.25-0.50/second

## Support

Need help? Check:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

Happy deploying! 🚀
