Windows — Oracle Instant Client (thick-mode) install

This project can use python-oracledb in "thick" (OCI) mode to connect to older Oracle DB versions.

Steps to install the Oracle Instant Client and configure the backend:

1) Download Instant Client (Basic or Basic Light)
   - Go to: https://www.oracle.com/database/technologies/instant-client.html
   - Choose the matching platform and a supported version (e.g., 19c/21c).
   - Download the ZIP (e.g. instantclient-basic-windows.x64-19.19.0.0.0dbru.zip).

2) Unzip it somewhere on your machine, for example:
   C:\instantclient_19_14

3) (Optional) Add this folder to your PATH in Windows so other tools also find it.
   - Control Panel → System → Advanced system settings → Environment Variables
   - Add C:\instantclient_19_14 to PATH (restart shells/editors after changing PATH)

4) Configure the project to use thick mode
   - Open `backend/.env` and set the ORACLE_CLIENT_LIBDIR variable to the location from step 2, for example:
     ORACLE_CLIENT_LIBDIR=C:\instantclient_19_14

5) The application will attempt to call oracledb.init_oracle_client(lib_dir=ORACLE_CLIENT_LIBDIR) when this is set.
   - The code is already added to `backend/database.py` — no further code changes are required.

6) Start the backend (in your project root with virtual env active):

```powershell
# Ensure venv active
.\venv\Scripts\Activate.ps1
# Start the app
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

If you see a message saying DPY-3010 in thin-mode, thick-mode will typically resolve it once the Instant Client is correctly installed and ORACLE_CLIENT_LIBDIR points at the client directory.

Troubleshooting
- If you get an error during init_oracle_client, check that `lib_dir` points to the Instant Client root directory (where the DLLs are located). You may need to restart the terminal/IDE.
- If the server requires a full Oracle client setup or wallet (OCI), follow the DB admin's guidance for wallet files and environment variables.

If you want, I can:
- Edit `.env` for you with ORACLE_CLIENT_LIBDIR if you give me the path, and then try starting the server here.
- Walk you through a manual local install step-by-step if you'd like to perform it yourself and test.
