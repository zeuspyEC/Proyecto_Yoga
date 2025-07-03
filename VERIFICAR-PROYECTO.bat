@echo off
echo.
echo 🔍 Verificando estructura del proyecto SoftZen...
echo.

set "missing_count=0"

echo ✅ Verificando archivos principales...

if exist "frontend\index.html" (
    echo ✅ frontend\index.html
) else (
    echo ❌ frontend\index.html - FALTA
    set /a missing_count+=1
)

if exist "frontend\app.js" (
    echo ✅ frontend\app.js
) else (
    echo ❌ frontend\app.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\styles.css" (
    echo ✅ frontend\styles.css
) else (
    echo ❌ frontend\styles.css - FALTA
    set /a missing_count+=1
)

if exist "frontend\js\firebase-config.js" (
    echo ✅ frontend\js\firebase-config.js
) else (
    echo ❌ frontend\js\firebase-config.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\js\auth.js" (
    echo ✅ frontend\js\auth.js
) else (
    echo ❌ frontend\js\auth.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\js\dashboard-complete.js" (
    echo ✅ frontend\js\dashboard-complete.js
) else (
    echo ❌ frontend\js\dashboard-complete.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\js\notifications.js" (
    echo ✅ frontend\js\notifications.js
) else (
    echo ❌ frontend\js\notifications.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\js\therapy-data.js" (
    echo ✅ frontend\js\therapy-data.js
) else (
    echo ❌ frontend\js\therapy-data.js - FALTA
    set /a missing_count+=1
)

if exist "frontend\manifest.json" (
    echo ✅ frontend\manifest.json
) else (
    echo ❌ frontend\manifest.json - FALTA
    set /a missing_count+=1
)

echo.
echo 📁 Verificando directorio de imágenes...

if not exist "frontend\img" (
    echo ❌ Directorio frontend\img no existe
    echo 📁 Creando directorio frontend\img...
    mkdir "frontend\img"
    echo ✅ Directorio creado
) else (
    echo ✅ Directorio frontend\img existe
)

if exist "frontend\img\icon-192.png" (
    echo ✅ frontend\img\icon-192.png
) else (
    echo ❌ frontend\img\icon-192.png - FALTA
    echo 💡 Ejecuta GENERAR-ICONOS.html para crear los íconos
    set /a missing_count+=1
)

if exist "frontend\img\icon-512.png" (
    echo ✅ frontend\img\icon-512.png
) else (
    echo ❌ frontend\img\icon-512.png - FALTA
    echo 💡 Ejecuta GENERAR-ICONOS.html para crear los íconos
    set /a missing_count+=1
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📊 RESUMEN DE VERIFICACIÓN
echo ═══════════════════════════════════════════════════════════════

if %missing_count%==0 (
    echo 🎉 ¡TODOS LOS ARCHIVOS PRINCIPALES ESTÁN PRESENTES!
    echo.
    echo 🚀 PASOS PARA RESOLVER EL PROBLEMA DE CARGA:
    echo    1. Abrir LIMPIAR-Y-VERIFICAR.html en el navegador
    echo    2. Hacer clic en 'Limpiar Datos Corruptos'
    echo    3. Hacer clic en 'Verificar Firebase'
    echo    4. Abrir frontend\index.html
    echo.
    echo 🔑 CREDENCIALES DE PRUEBA:
    echo    Instructor: admin@softzen.com / SoftZen2024
    echo    Paciente:   paciente@softzen.com / SoftZen2024
) else (
    echo ⚠️ FALTAN %missing_count% ARCHIVOS IMPORTANTES
    echo    Verifica la estructura del proyecto y los archivos faltantes arriba.
)

echo.
echo 🧹 ARCHIVOS DE AYUDA DISPONIBLES:
echo    • LIMPIAR-Y-VERIFICAR.html     (Limpieza automática)
echo    • GENERAR-ICONOS.html          (Crear íconos PNG)
echo    • EJECUTAR-LIMPIEZA-AHORA.md   (Instrucciones detalladas)

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ VERIFICACIÓN COMPLETADA
echo ═══════════════════════════════════════════════════════════════

echo.
echo 💡 SOLUCIÓN RÁPIDA:
echo    1. Doble clic en LIMPIAR-Y-VERIFICAR.html
echo    2. Seguir las instrucciones en pantalla
echo    3. Probar la aplicación

echo.
pause
