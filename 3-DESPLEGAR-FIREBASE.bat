@echo off
chcp 65001 > nul
color 0A

echo.
echo ==================================================
echo      SOFTZEN - DESPLEGAR EN FIREBASE
echo ==================================================
echo.

REM Verificar si Firebase CLI está instalado
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Firebase CLI no está instalado.
    echo.
    echo Por favor, instala Firebase CLI ejecutando:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo [INFO] Verificando autenticación de Firebase...
firebase login:list | findstr "@" >nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] No estás autenticado en Firebase.
    echo [INFO] Iniciando proceso de autenticación...
    echo.
    firebase login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo en la autenticación.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Preparando proyecto para despliegue...
echo.

REM Crear archivo .env de producción
echo # Producción > frontend\.env
echo REACT_APP_ENVIRONMENT=production >> frontend\.env

echo [INFO] Desplegando a Firebase Hosting...
echo.

firebase deploy --only hosting

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==================================================
    echo       ✅ DESPLIEGUE EXITOSO
    echo ==================================================
    echo.
    echo Tu aplicación está disponible en:
    echo https://pagina-yoga.web.app
    echo https://pagina-yoga.firebaseapp.com
    echo.
    echo [INFO] También puedes desplegar:
    echo   - Firestore Rules: firebase deploy --only firestore:rules
    echo   - Storage Rules: firebase deploy --only storage:rules
    echo   - Todo: firebase deploy
    echo.
) else (
    echo.
    echo ==================================================
    echo       ❌ ERROR EN EL DESPLIEGUE
    echo ==================================================
    echo.
    echo Revisa los mensajes de error arriba.
    echo.
)

pause