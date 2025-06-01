@echo off
echo Starting TIA Schedule Builder Local Server...
echo.
echo Checking for Python...

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python found! Starting server on http://localhost:8000
    echo.
    echo Open your browser and go to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found. Trying Python3...
    python3 --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Python3 found! Starting server on http://localhost:8000
        echo.
        echo Open your browser and go to: http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo.
        python3 -m http.server 8000
    ) else (
        echo Neither Python nor Python3 found.
        echo Please install Python or use an alternative method.
        echo.
        echo Alternative: Install Node.js and run 'npx http-server'
        pause
    )
)
