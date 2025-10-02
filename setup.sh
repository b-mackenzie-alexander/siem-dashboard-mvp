#!/bin/bash

echo "🚀 Setting up SIEM Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "🎉 Setup finished successfully!"
    echo ""
    echo "To start the application, run:"
    echo "  npm run dev"
    echo ""
    echo "The dashboard will open automatically at http://localhost:3000"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi