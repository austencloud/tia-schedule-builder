# TIA Schedule Builder - PowerShell Server Starter
# This script automatically detects available tools and starts a local server

Write-Host "🚀 TIA Schedule Builder - Local Server Starter" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Function to test if a command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to start Python server
function Start-PythonServer {
    Write-Host "🐍 Starting Python HTTP Server..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    try {
        python -m http.server 8000
    }
    catch {
        Write-Host "❌ Failed to start Python server" -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to start Node.js server
function Start-NodeServer {
    Write-Host "📦 Starting Node.js HTTP Server..." -ForegroundColor Yellow
    
    # Check if http-server is installed
    if (Test-Command "http-server") {
        Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
        Write-Host ""
        
        try {
            http-server -p 8000 -o -c-1
        }
        catch {
            Write-Host "❌ Failed to start Node.js server" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "Installing http-server globally..." -ForegroundColor Yellow
        try {
            npm install -g http-server
            Write-Host "✅ http-server installed successfully" -ForegroundColor Green
            Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
            Write-Host ""
            http-server -p 8000 -o -c-1
        }
        catch {
            Write-Host "❌ Failed to install or start http-server" -ForegroundColor Red
            return $false
        }
    }
    return $true
}

# Function to open browser
function Open-Browser {
    Write-Host "🌐 Opening browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:8000"
}

# Main execution
Write-Host "🔍 Detecting available tools..." -ForegroundColor Yellow
Write-Host ""

# Check for Python
if (Test-Command "python") {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Starting server in 3 seconds..." -ForegroundColor Yellow
    Write-Host "You can open your browser manually to: http://localhost:8000" -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    
    # Start browser after a delay
    Start-Job -ScriptBlock { 
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:8000" 
    } | Out-Null
    
    Start-PythonServer
}
# Check for Node.js
elseif (Test-Command "node") {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Starting server in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Start-NodeServer
}
# Check for npx (comes with Node.js)
elseif (Test-Command "npx") {
    Write-Host "✅ NPX found (Node.js package runner)" -ForegroundColor Green
    Write-Host "📦 Using npx to run http-server..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    # Start browser after a delay
    Start-Job -ScriptBlock { 
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:8000" 
    } | Out-Null
    
    try {
        npx http-server -p 8000 -o -c-1
    }
    catch {
        Write-Host "❌ Failed to start server with npx" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ No suitable server tools found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Installation Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Install Python:" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://python.org/downloads/" -ForegroundColor Gray
    Write-Host "  2. Run installer and check 'Add to PATH'" -ForegroundColor Gray
    Write-Host "  3. Restart this script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 - Install Node.js:" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://nodejs.org/" -ForegroundColor Gray
    Write-Host "  2. Run installer with default settings" -ForegroundColor Gray
    Write-Host "  3. Restart this script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3 - Use Standalone Version:" -ForegroundColor Cyan
    Write-Host "  1. Open 'index-standalone.html' directly in browser" -ForegroundColor Gray
    Write-Host "  2. Limited functionality, but works without server" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 4 - Use VS Code Live Server:" -ForegroundColor Cyan
    Write-Host "  1. Install VS Code and 'Live Server' extension" -ForegroundColor Gray
    Write-Host "  2. Right-click index.html and select 'Open with Live Server'" -ForegroundColor Gray
    Write-Host ""
    
    # Ask if user wants to open standalone version
    $response = Read-Host "Would you like to open the standalone version now? (y/n)"
    if ($response -eq "y" -or $response -eq "Y" -or $response -eq "yes") {
        Write-Host "🌐 Opening standalone version..." -ForegroundColor Yellow
        $standalonePath = Join-Path $PSScriptRoot "index-standalone.html"
        Start-Process $standalonePath
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
