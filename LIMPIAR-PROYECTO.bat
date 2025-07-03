@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
color 0E

echo.
echo ==============================================================
echo           SOFTZEN - LIMPIEZA TOTAL DEL PROYECTO
echo ==============================================================
echo.
echo [ADVERTENCIA] Este script eliminara TODOS los archivos 
echo              innecesarios y dejara solo lo esencial.
echo.
echo Archivos que se MANTENDRAN:
echo - Carpetas: frontend, backend, .firebase, .git
echo - Configuracion: firebase.json, .firebaserc, firestore.*, storage.rules, .gitignore, .env
echo - Documentacion: README.md
echo - Scripts nuevos: 1-INSTALAR.bat, 2-EJECUTAR-LOCAL.bat, 3-DESPLEGAR-FIREBASE.bat
echo.
echo Archivos que se ELIMINARAN:
echo - Todos los .md extras
echo - Todos los .bat antiguos
echo - Archivos .js sueltos en la raiz
echo - Archivos .db en la raiz
echo - package.json y node_modules de la raiz
echo.
set /p confirm="Estas seguro que quieres continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo [CANCELADO] No se elimino ningun archivo.
    pause
    exit /b 0
)

echo.
echo [INICIANDO] Limpieza del proyecto...
echo.

:: ====== ELIMINAR ARCHIVOS .MD INNECESARIOS ======
echo [1/6] Eliminando documentacion innecesaria...
set "files_to_delete=ACCESO_SISTEMA.md CONFIGURAR_FIREBASE_RAPIDO.md CORRECCIONES-COMPLETADAS.md CORRECCIONES_APLICADAS.md GUIA_RAPIDA_ACCESO.md INICIO_RAPIDO.md INSTRUCCIONES_FINALES.md LISTO-PARA-USAR.md PROYECTO-LISTO.md RESTAURACION-COMPLETA.md SOLUCION_PROBLEMAS.md SOLUCION_RAPIDA.md BATCH_FILES_FIXED.md"

for %%f in (!files_to_delete!) do (
    if exist "%%f" (
        del /f /q "%%f" 2>nul
        echo    [OK] Eliminado: %%f
    )
)

:: ====== ELIMINAR ARCHIVOS .BAT ANTIGUOS ======
echo.
echo [2/6] Eliminando scripts antiguos...
set "bats_to_delete=check-port.bat FIX-PROJECT-NOW.bat INICIAR-SOFTZEN.bat PROYECTO-RESTAURADO.bat restart-server.bat verify-optimization.bat cleanup-optimize.bat deploy-optimizado-v2.bat dev-center.bat deploy-optimizado.bat deploy-optimizado-final.bat test-batch-files.bat"

for %%f in (!bats_to_delete!) do (
    if exist "%%f" (
        del /f /q "%%f" 2>nul
        echo    [OK] Eliminado: %%f
    )
)

:: ====== ELIMINAR ARCHIVOS .JS DE LA RAIZ ======
echo.
echo [3/6] Eliminando archivos JavaScript de la raiz...
set "js_to_delete=fix-softzen.js predefinedTherapy.js server.js setup-firebase-auth-only.js arreglar-produccion.js"

for %%f in (!js_to_delete!) do (
    if exist "%%f" (
        del /f /q "%%f" 2>nul
        echo    [OK] Eliminado: %%f
    )
)

:: ====== ELIMINAR OTROS ARCHIVOS INNECESARIOS ======
echo.
echo [4/6] Eliminando otros archivos innecesarios...
if exist "therapy.db" (
    del /f /q "therapy.db" 2>nul
    echo    [OK] Eliminado: therapy.db
)

if exist "package.json" (
    del /f /q "package.json" 2>nul
    echo    [OK] Eliminado: package.json (raiz)
)

if exist "package-lock.json" (
    del /f /q "package-lock.json" 2>nul
    echo    [OK] Eliminado: package-lock.json (raiz)
)

if exist ".env.production" (
    del /f /q ".env.production" 2>nul
    echo    [OK] Eliminado: .env.production
)

:: ====== ELIMINAR CARPETAS INNECESARIAS ======
echo.
echo [5/6] Eliminando carpetas innecesarias...
if exist "node_modules" (
    echo    [INFO] Eliminando node_modules de la raiz...
    rmdir /s /q "node_modules" 2>nul
    echo    [OK] Eliminado: node_modules (raiz)
)

if exist "public" (
    rmdir /s /q "public" 2>nul
    echo    [OK] Eliminado: public
)

if exist "scripts" (
    rmdir /s /q "scripts" 2>nul
    echo    [OK] Eliminado: scripts
)

if exist "dataconnect" (
    rmdir /s /q "dataconnect" 2>nul
    echo    [OK] Eliminado: dataconnect
)

if exist "y" (
    rmdir /s /q "y" 2>nul
    echo    [OK] Eliminado: y
)

:: ====== CREAR NUEVOS SCRIPTS SIMPLIFICADOS ======
echo.
echo [6/6] Creando scripts simplificados...

:: Script 1: INSTALAR
echo [INFO] Creando 1-INSTALAR.bat...
(
echo @echo off
echo chcp 65001 ^> nul
echo color 0A
echo.
echo echo.
echo echo ==================================================
echo echo          SOFTZEN - INSTALACION COMPLETA
echo echo ==================================================
echo echo.
echo.
echo :: Verificar Node.js
echo node --version ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo [ERROR] Node.js no esta instalado
echo     echo Descargalo de: https://nodejs.org
echo     pause
echo     exit /b 1
echo ^)
echo.
echo :: Instalar Firebase CLI si no existe
echo firebase --version ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo [INFO] Instalando Firebase CLI...
echo     call npm install -g firebase-tools
echo ^)
echo.
echo :: Instalar dependencias del backend
echo echo [INFO] Instalando dependencias del backend...
echo cd backend
echo call npm install
echo cd ..
echo.
echo echo.
echo echo [OK] Instalacion completada!
echo echo.
echo echo Ahora puedes ejecutar: 2-EJECUTAR-LOCAL.bat
echo echo.
echo pause
) > "1-INSTALAR.bat"
echo    [OK] Creado: 1-INSTALAR.bat

:: Script 2: EJECUTAR LOCAL
echo [INFO] Creando 2-EJECUTAR-LOCAL.bat...
(
echo @echo off
echo chcp 65001 ^> nul
echo color 0B
echo.
echo echo.
echo echo ==================================================
echo echo       SOFTZEN - EJECUTAR EN LOCAL
echo echo ==================================================
echo echo.
echo echo [INFO] Iniciando servidor local...
echo echo.
echo echo Credenciales Demo:
echo echo   Instructor: admin@softzen.com / SoftZen2024!
echo echo   Paciente: paciente@softzen.com / SoftZen2024!
echo echo.
echo echo URL Local: http://localhost:3000
echo echo.
echo echo Presiona Ctrl+C para detener el servidor
echo echo ==================================================
echo echo.
echo.
echo cd backend
echo npm start
) > "2-EJECUTAR-LOCAL.bat"
echo    [OK] Creado: 2-EJECUTAR-LOCAL.bat

:: Script 3: DESPLEGAR
echo [INFO] Creando 3-DESPLEGAR-FIREBASE.bat...
(
echo @echo off
echo chcp 65001 ^> nul
echo color 0D
echo.
echo echo.
echo echo ==================================================
echo echo      SOFTZEN - DESPLEGAR EN FIREBASE
echo echo ==================================================
echo echo.
echo.
echo :: Verificar autenticacion
echo firebase projects:list ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo [INFO] Iniciando sesion en Firebase...
echo     firebase login
echo ^)
echo.
echo echo [INFO] Desplegando a Firebase Hosting...
echo firebase deploy --only hosting
echo.
echo echo.
echo echo ==================================================
echo echo URL de Produccion: https://pagina-yoga.web.app
echo echo ==================================================
echo echo.
echo pause
) > "3-DESPLEGAR-FIREBASE.bat"
echo    [OK] Creado: 3-DESPLEGAR-FIREBASE.bat

:: ====== RESUMEN FINAL ======
echo.
echo ==============================================================
echo                    LIMPIEZA COMPLETADA
echo ==============================================================
echo.
echo [EXITO] El proyecto ha sido limpiado y simplificado!
echo.
echo ESTRUCTURA FINAL:
echo   /backend        - Servidor y API
echo   /frontend       - Aplicacion web
echo   /.firebase      - Cache de Firebase
echo   /.git          - Control de versiones
echo   firebase.json  - Configuracion de Firebase
echo   .firebaserc    - Proyecto de Firebase
echo   README.md      - Documentacion
echo.
echo SCRIPTS DISPONIBLES:
echo   1-INSTALAR.bat          - Instala todo lo necesario
echo   2-EJECUTAR-LOCAL.bat    - Ejecuta la aplicacion localmente
echo   3-DESPLEGAR-FIREBASE.bat - Despliega cambios a produccion
echo.
echo ==============================================================
echo.
pause