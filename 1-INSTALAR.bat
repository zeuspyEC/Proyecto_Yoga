@echo off
chcp 65001 > nul
color 0A

echo.
echo ==================================================
echo          SOFTZEN - INSTALACION COMPLETA
echo ==================================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Descargalo de: https://nodejs.org
    pause
    exit /b 1
)

:: Instalar Firebase CLI si no existe
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando Firebase CLI...
    call npm install -g firebase-tools
)

:: Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
cd backend
call npm install
cd ..

echo.
echo [OK] Instalacion completada
echo.
echo Ahora puedes ejecutar: 2-EJECUTAR-LOCAL.bat
echo.
pause
