# Crime Tracking System — Run Instructions

This repository contains a FastAPI backend (`backend/`) and a static frontend (`frontend/`).

Goal: run both frontend and backend with a single command: `npm start` (from the repo root).

Prerequisites
- Node.js + npm installed (for `npm start`).
- Python 3.10+ (or whichever your project uses) and pip.
- Recommended: a virtual environment for Python (`.venv`).

Quick start (Windows PowerShell)

1) Fix PowerShell script policy (if you see activation blocked):

```powershell
# allow local/script activation for current user
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

2) Create/activate Python venv and install Python deps (optional but recommended):

```powershell
# from project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

3) Install Node.js deps and run both servers

```powershell
# from project root
npm install
npm start
```

This runs two processes concurrently:
- Backend: `uvicorn backend.main:app --reload --port 8000`
- Frontend static server: `http-server frontend -p 3000`

Open the frontend in your browser:
- http://127.0.0.1:3000 (served by `http-server`)
- Backend API docs: http://127.0.0.1:8000/docs

Notes
- If you prefer to run backend with your activated venv python, activate the venv before `npm start` so the `python` command resolves to the venv.
- The backend already enables CORS for all origins, so the frontend can call the API on port 8000.
- To test DB connectivity directly from the repository, run:

```powershell
python .\backend\test_conn.py
```

Troubleshooting
- If `npm start` fails because `concurrently` or `http-server` are missing, run `npm install` first.
- If Python is not on PATH or you want to ensure the venv Python is used, activate the venv before running `npm start`.

If you want, I can: (A) modify `frontend/app.js` to use the backend host/ports explicitly, or (B) create a small PowerShell script that activates the venv and runs `npm start` so the correct Python interpreter is guaranteed. Tell me which you'd like next.

**One-Click Start (Windows)**

- **What:** Double-click `start_all.bat` in the repository root to start both backend and frontend in one step. The batch file calls `start.ps1` which: creates/activates the `.venv`, installs Node deps, and runs `npm start`.
- **Usage:** From File Explorer, double-click `start_all.bat`, or run in cmd/powershell from the project root:

```powershell
# basic
.\start_all.bat

# recreate the Python venv first (useful if dependencies changed)
.\start_all.bat recreate
```

- **Notes:** `start_all.bat` passes through to `start.ps1` and therefore respects its checks (Python & npm on PATH, installs, etc.). Use `recreate` to force `python -m venv .venv` before starting.
