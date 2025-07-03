#!/bin/bash

# Script de verificación y corrección rápida para SoftZen
# Autor: Assistant
# Fecha: $(date)

echo "🔍 Verificando estructura del proyecto SoftZen..."

# Verificar archivos principales
files_to_check=(
    "frontend/index.html"
    "frontend/app.js"
    "frontend/styles.css"
    "frontend/js/firebase-config.js"
    "frontend/js/auth.js"
    "frontend/js/dashboard-complete.js"
    "frontend/js/notifications.js"
    "frontend/js/therapy-data.js"
    "frontend/js/therapy-manager.js"
    "frontend/js/patient-manager.js"
    "frontend/js/session-manager.js"
    "frontend/manifest.json"
    "frontend/sw.js"
)

missing_files=()

for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        echo "❌ Falta: $file"
    else
        echo "✅ Existe: $file"
    fi
done

# Verificar directorio de imágenes
if [ ! -d "frontend/img" ]; then
    echo "❌ Directorio frontend/img no existe"
    echo "📁 Creando directorio frontend/img..."
    mkdir -p frontend/img
    echo "✅ Directorio creado"
fi

# Verificar íconos
if [ ! -f "frontend/img/icon-192.png" ]; then
    echo "❌ Falta: frontend/img/icon-192.png"
    echo "💡 Ejecuta GENERAR-ICONOS.html para crear los íconos"
fi

if [ ! -f "frontend/img/icon-512.png" ]; then
    echo "❌ Falta: frontend/img/icon-512.png"
    echo "💡 Ejecuta GENERAR-ICONOS.html para crear los íconos"
fi

echo ""
echo "📊 Resumen de verificación:"
echo "Total de archivos verificados: ${#files_to_check[@]}"
echo "Archivos faltantes: ${#missing_files[@]}"

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 ¡Todos los archivos principales están presentes!"
    echo ""
    echo "🚀 Pasos para resolver el problema de carga:"
    echo "1. Abrir LIMPIAR-Y-VERIFICAR.html"
    echo "2. Hacer clic en 'Limpiar Datos Corruptos'"
    echo "3. Hacer clic en 'Verificar Firebase'"
    echo "4. Abrir frontend/index.html"
    echo ""
    echo "🔑 Credenciales de prueba:"
    echo "   Instructor: admin@softzen.com / SoftZen2024"
    echo "   Paciente: paciente@softzen.com / SoftZen2024"
else
    echo "⚠️ Faltan archivos importantes. Verifica la estructura del proyecto."
    echo ""
    echo "Archivos faltantes:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

echo ""
echo "🧹 Archivos de ayuda disponibles:"
echo "  - LIMPIAR-Y-VERIFICAR.html (Limpieza automática)"
echo "  - GENERAR-ICONOS.html (Crear íconos)"
echo "  - EJECUTAR-LIMPIEZA-AHORA.md (Instrucciones detalladas)"

echo ""
echo "✅ Verificación completada"
