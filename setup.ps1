#!/usr/bin/env pwsh

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  RAG Chatbot - Quick Start Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found. Please install Python 3.9 or higher." -ForegroundColor Red
    exit 1
}
Write-Host "✓ $pythonVersion" -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Setting Up Backend" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Backend setup
Set-Location backend

Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\activate

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check for .env file
if (-Not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a .env file with your OpenAI API key:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Copy .env.example to .env:" -ForegroundColor Cyan
    Write-Host "   copy .env.example .env" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Edit .env and add your OpenAI API key:" -ForegroundColor Cyan
    Write-Host "   OPENAI_API_KEY=sk-your-actual-key-here" -ForegroundColor White
    Write-Host ""
    Write-Host "Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    Write-Host ""
    
    # Copy example file
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please edit backend\.env and add your OpenAI API key before running the servers." -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Setting Up Frontend" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Frontend setup
Set-Location frontend

Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Set-Location ..

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit backend\.env and add your OpenAI API key" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Start the backend (in one terminal):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\activate" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "3. Start the frontend (in a NEW terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Open your browser to:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "See SETUP.md for detailed instructions and troubleshooting." -ForegroundColor Gray
Write-Host ""
