param(
    [switch]$RecreateVenv
)

# start.ps1 - Activate (or create) .venv, install node deps, and run npm start from repo root

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $projectRoot

try {
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Error "Python not found on PATH. Install Python or ensure 'python' is available."
        exit 1
    }

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm not found on PATH. Install Node.js (which includes npm)."
        exit 1
    }

    if ($RecreateVenv -or -not (Test-Path ".venv")) {
        Write-Host "Creating virtual environment at $projectRoot\.venv ..."
        python -m venv .venv
        $needsPip = $true
    }

    # Temporarily relax execution policy for this process to allow activation
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

    # Activate the venv in the current session
    $activate = Join-Path $projectRoot ".venv\Scripts\Activate.ps1"
    if (Test-Path $activate) {
        . $activate
        Write-Host "Activated venv: $projectRoot\.venv"
        if ($needsPip) {
            Write-Host "Installing Python dependencies..."
            python -m pip install --upgrade pip
            pip install -r backend/requirements.txt
        }
    } else {
        Write-Error "Activation script not found at $activate"
        exit 1
    }

    Write-Host "Installing Node dependencies (if necessary)..."
    npm install

    Write-Host "Starting frontend + backend via 'npm start' (Ctrl+C to stop)"
    npm start
}
finally {
    Pop-Location
}
