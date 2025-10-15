# Environment Variables for Vercel Deployment

## Required Environment Variables

Copy these environment variables to your Vercel project settings during deployment.

### 1. Database (PostgreSQL)
```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```
**Required:** Yes
**Description:** PostgreSQL connection string. You can use:
- Vercel Postgres (recommended)
- Neon
- Supabase
- Railway
- Your own PostgreSQL instance

---

### 2. Authentication (NextAuth v5)
```
AUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"
AUTH_URL="https://your-app.vercel.app"
```
**Required:** Yes
**Description:**
- `AUTH_SECRET`: Generate using: `openssl rand -base64 32`
- `AUTH_URL`: Your Vercel deployment URL (e.g., https://rtim.vercel.app)

---

### 3. Redis (Optional but Recommended)
```
REDIS_URL="redis://default:password@host:port"
```
**Required:** No (but recommended for production)
**Description:** Redis connection for job queue management. You can use:
- Upstash Redis (recommended for Vercel)
- Redis Cloud
- Your own Redis instance

---

### 4. App Configuration
```
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_NAME="RTIM"
DEFAULT_STARTER_CREDITS="0"
```
**Required:** Yes
**Description:**
- `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `DEFAULT_STARTER_CREDITS`: Set to "0" (BYOK model)

---

### 5. Stripe (Optional - for billing features)
```
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
**Required:** No (only if you want to enable billing/credits features)
**Description:** Stripe API keys for payment processing
- Get keys from: https://dashboard.stripe.com/apikeys

---

### 6. OAuth Providers (Optional)
```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```
**Required:** No (only if you want OAuth login)
**Description:** OAuth credentials for social login

---

### 7. Feature Flags
```
ENABLE_PROMPT_ENHANCEMENT="true"
ENABLE_STYLE_PROFILES="true"
ENABLE_COLLABORATION="false"
ENABLE_API_ACCESS="true"
```
**Required:** No (defaults will be used)
**Description:** Enable/disable specific features

---

### 8. Rate Limiting
```
RATE_LIMIT_PER_MINUTE="10"
RATE_LIMIT_PER_HOUR="100"
MAX_CONCURRENT_JOBS="5"
```
**Required:** No (defaults will be used)
**Description:** API rate limiting configuration

---

## IMPORTANT: OpenAI API Keys

**❌ DO NOT ADD OPENAI_API_KEY TO VERCEL**

RTIM uses a **Bring Your Own Key (BYOK)** model:
- Users provide their own OpenAI API keys through the app
- API keys are stored securely in the database (encrypted)
- No system-wide OpenAI API key is needed
- This ensures users have full control over their OpenAI billing

---

## Minimal Setup (Required Only)

For a basic deployment, you only need these:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://your-app.vercel.app"

# App Config
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_NAME="RTIM"
DEFAULT_STARTER_CREDITS="0"
```

---

## Recommended Setup (Production)

For production, add Redis for better performance:

```bash
# All required variables above +

# Redis (for job queue)
REDIS_URL="redis://..."
```

---

## Quick Start with Vercel

1. **Create Vercel Postgres Database:**
   - Go to Vercel Dashboard → Storage → Create Database
   - Select "Postgres"
   - Copy the `DATABASE_URL` connection string

2. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Add Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all required variables
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy:**
   - Push to GitHub
   - Import repository to Vercel
   - Vercel will automatically deploy

5. **Run Database Migration:**
   After first deployment, run:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```
   Or use Vercel CLI to run the migration in production

---

## Security Notes

- ✅ `.env` is already in `.gitignore` - it won't be pushed to GitHub
- ✅ Never commit API keys or secrets to your repository
- ✅ Use Vercel's environment variables for all sensitive data
- ✅ Rotate your `AUTH_SECRET` regularly
- ✅ User OpenAI API keys are encrypted in the database

---

## Need Help?

- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Upstash Redis: https://upstash.com/
- NextAuth: https://authjs.dev/
- Prisma: https://www.prisma.io/docs
