# RTIM - Next-Gen AI Video Generation Platform

Transform your ideas into professional videos using OpenAI's Sora-2 API with intelligent prompt enhancement and style optimization.

## 🔑 BYOK (Bring Your Own Key) Model

RTIM uses a **Bring Your Own Key** model:
- ✅ Platform is completely **FREE**
- ✅ Users provide their **own OpenAI API keys**
- ✅ **Direct billing** from OpenAI to user
- ✅ **Full transparency** and control over costs
- ✅ No platform fees or markups

## Features

### Core Capabilities
- **AI Video Generation**: Powered by OpenAI's Sora-2 and Sora-2 Pro models
- **Intelligent Prompt Enhancement**: Automatic optimization using GPT-4 to improve video quality
- **Style Templates**: Pre-built cinematic, documentary, commercial, and animation styles
- **BYOK Support**: Secure storage and management of user OpenAI API keys
- **Progress Tracking**: Real-time video generation status updates
- **Team Collaboration**: Workspaces for team projects

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Users need their own OpenAI API key with Sora access

### Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   - See `VERCEL_ENV_VARS.md` for complete list
   - Minimum required:
     - `DATABASE_URL` (Vercel Postgres recommended)
     - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
     - `AUTH_URL` (your Vercel app URL)
     - `NEXT_PUBLIC_APP_URL` (your Vercel app URL)

4. **Deploy!**
   - Vercel will automatically build and deploy
   - After first deployment, users can add their OpenAI API keys in Settings

**Important:** No system-wide OpenAI API key needed. Users provide their own keys through the app interface.

## Documentation

See the codebase for:
- `/lib/services/sora-api.ts` - Sora API integration
- `/lib/services/prompt-enhancement.ts` - AI prompt optimization
- `/prisma/schema.prisma` - Database schema
- `/app/api/*` - API routes

## Tech Stack

- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- OpenAI Sora-2 & GPT-4
- NextAuth.js
- Tailwind CSS + Shadcn/ui

---

Made with ❤️ for creators everywhere
