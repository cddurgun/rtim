# RTIM - Next-Gen AI Video Generation Platform

Transform your ideas into professional videos using OpenAI's Sora-2 API with intelligent prompt enhancement and style optimization.

## Features

### Core Capabilities
- **AI Video Generation**: Powered by OpenAI's Sora-2 and Sora-2 Pro models
- **Intelligent Prompt Enhancement**: Automatic optimization using GPT-4 to improve video quality
- **Style Templates**: Pre-built cinematic, documentary, commercial, and animation styles
- **Cost Estimation**: Real-time credit cost calculation before generation
- **Credit System**: Flexible tiered pricing with automatic refunds on failures
- **Progress Tracking**: Real-time video generation status updates

##Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key with Sora access

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

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Your OpenAI API key is already configured in .env

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
