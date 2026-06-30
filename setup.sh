#!/bin/bash

# IMII Domes Stability - Quick Setup Script
# This script helps you quickly set up the development environment

set -e

echo "🚀 IMII Domes Stability - Quick Setup"
echo "======================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or later."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed. You'll need it for deployment."
    echo "   Install from: https://aws.amazon.com/cli/"
fi

if ! command -v cdk &> /dev/null; then
    echo "⚠️  AWS CDK is not installed. Installing AWS CDK..."
    npm install -g aws-cdk
fi

echo "✅ Prerequisites checked"
echo ""

# Back-end setup
echo "📦 Setting up back-end..."
cd back-end
npm install

echo "📦 Installing Lambda layer dependencies..."
cd lambda/layers/common/nodejs
npm install
cd ../../../..

echo "✅ Back-end setup complete"
echo ""

# Front-end setup
echo "📦 Setting up front-end..."
cd ../front-end
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    echo "VITE_API_URL=http://localhost:3000/api" > .env.local
    echo "⚠️  Don't forget to update VITE_API_URL after deploying the back-end!"
fi

echo "✅ Front-end setup complete"
echo ""

cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "==========="
echo ""
echo "1. Deploy the back-end:"
echo "   cd back-end"
echo "   npm run build"
echo "   npm run deploy"
echo ""
echo "2. Seed the database:"
echo "   curl -X POST https://your-api-url/api/seed"
echo ""
echo "3. Update front-end/.env.local with your API URL"
echo ""
echo "4. Run the front-end:"
echo "   cd front-end"
echo "   pnpm run dev"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
