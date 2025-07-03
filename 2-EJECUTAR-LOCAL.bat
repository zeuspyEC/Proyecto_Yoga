@echo off
chcp 65001 > nul
color 0B

echo.
echo ==================================================
echo       SOFTZEN - EJECUTAR EN LOCAL
echo ==================================================
echo.
echo [INFO] Iniciando servidor local...
echo.
echo Credenciales Demo:
echo   Instructor: admin@softzen.com / SoftZen2024
echo   Paciente: paciente@softzen.com / SoftZen2024
echo.
echo URL Local: http://localhost:3001
echo.
echo Presiona Ctrl+C para detener el servidor
echo ==================================================
echo.

cd backend
npm start
