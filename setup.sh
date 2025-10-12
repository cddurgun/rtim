#!/bin/bash

echo "🚀 RTIM Setup Script"
echo "===================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and add your credentials before continuing"
    echo ""
    exit 1
else
    echo "✅ .env file found"
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=.*postgresql" .env; then
    echo "❌ DATABASE_URL not configured in .env"
    echo "Please add your PostgreSQL connection string"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "❌ OPENAI_API_KEY not configured in .env"
    echo "Please add your OpenAI API key"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing database schema..."
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
