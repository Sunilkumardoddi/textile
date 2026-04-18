@echo off
echo =======================================================
echo          Starting Traceability Project
echo =======================================================

echo.
echo [1/2] Setting up Backend...
cd backend
echo Installing Python dependencies...
"%LOCALAPPDATA%\Programs\Python\Python311\python.exe" -m pip install -r requirements.txt
echo Starting FastAPI Backend Server on port 8000...
start cmd /k "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
cd ..

echo.
echo [2/2] Setting up Frontend...
cd frontend
echo Cleaning old node packages...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Installing Node.js dependencies...
call npm install --legacy-peer-deps
echo Patching Webpack AJV dependencies...
call npm install ajv ajv-keywords --legacy-peer-deps
echo Starting React Frontend on port 3000...
start cmd /k npm start
cd ..

echo.
echo =======================================================
echo Project is launching!
echo.
echo IMPORTANT: If the backend window crashes immediately, 
echo it is likely because you do not have a local MongoDB 
echo server running. You must either install MongoDB locally
echo or update backend/.env with your MongoDB Atlas URL.
echo =======================================================
pause
