# 🧹 EJECUTAR LIMPIEZA INMEDIATA - SoftZen

⚠️ **PROBLEMA DETECTADO**: La aplicación no pasa de la pantalla de carga debido a datos corruptos de Firebase.

## 🔍 Diagnóstico del Problema

El error principal es:
```
Error enabling offline persistence. Falling back to persistence disabled: 
FirebaseError: [code=failed-precondition]: A newer version of the Firestore SDK 
was previously used and so the persisted data is not compatible with the version 
of the SDK you are now using.
```

Esto significa que hay datos antiguos de Firebase en IndexedDB que son incompatibles.

## 🚨 SOLUCIÓN INMEDIATA

### Opción 1: Limpieza Manual Rápida

1. **Abrir DevTools en el navegador** (F12)
2. **Ir a la pestaña "Application" o "Aplicación"**
3. **En el panel izquierdo, encontrar "Storage"**
4. **Hacer clic en "Clear storage" o "Limpiar almacenamiento"**
5. **Marcar todas las opciones:**
   - Local storage
   - Session storage
   - IndexedDB
   - WebSQL
   - Cookies
6. **Hacer clic en "Clear site data" o "Limpiar datos del sitio"**
7. **Recargar la página** (F5)

### Opción 2: Usando la Consola del Navegador

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña "Console"**
3. **Copiar y pegar este código:**

```javascript
// Limpiar IndexedDB de Firebase
async function limpiarFirebaseData() {
    console.log('🧹 Iniciando limpieza de datos corruptos...');
    
    // Limpiar localStorage
    localStorage.clear();
    console.log('✅ localStorage limpiado');
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage limpiado');
    
    // Limpiar IndexedDB
    if ('indexedDB' in window) {
        const dbNames = [
            'firebase-auth-db',
            'firebaseLocalStorageDb',
            'firebase-messaging-database',
            'firebase-heartbeat-store',
            'firebase-installations-store'
        ];
        
        for (const dbName of dbNames) {
            try {
                await new Promise((resolve) => {
                    const deleteReq = indexedDB.deleteDatabase(dbName);
                    deleteReq.onsuccess = () => {
                        console.log(`✅ ${dbName} eliminado`);
                        resolve();
                    };
                    deleteReq.onerror = () => resolve();
                    deleteReq.onblocked = () => resolve();
                });
            } catch (error) {
                console.log(`⚠️ No se pudo eliminar ${dbName}`);
            }
        }
    }
    
    console.log('🎉 Limpieza completada. Recargando página...');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Ejecutar limpieza
limpiarFirebaseData();
```

4. **Presionar Enter**
5. **Esperar a que se complete la limpieza**

### Opción 3: Usar el Archivo de Limpieza

1. **Abrir el archivo**: `GENERAR-ICONOS.html` en el navegador
2. **Este archivo también incluye limpieza automática**
3. **Seguir las instrucciones en pantalla**

## 🔧 VERIFICACIÓN

Después de la limpieza:

1. **Recargar la página**
2. **Verificar que aparezca la pantalla de login** (no la de carga infinita)
3. **Probar login con credenciales demo:**
   - Email: `admin@softzen.com`
   - Contraseña: `SoftZen2024`

## 📋 ARCHIVOS CORREGIDOS

Los siguientes archivos han sido actualizados para resolver problemas:

- ✅ `firebase-config.js` - Manejo robusto de persistencia
- ✅ `app.js` - Mejor flujo de inicialización  
- ✅ `auth.js` - Manejo de errores mejorado
- ✅ `GENERAR-ICONOS.html` - Generador de íconos para manifest

## 🎯 PASOS FINALES

1. **Ejecutar limpieza** (usar cualquiera de las opciones arriba)
2. **Generar íconos** (abrir `GENERAR-ICONOS.html`)
3. **Guardar íconos descargados** en `frontend/img/`
4. **Probar la aplicación**

## 🆘 SI PERSISTE EL PROBLEMA

Si después de la limpieza sigue sin funcionar:

1. **Verificar que todos los archivos JS estén en su lugar**
2. **Comprobar la consola del navegador** para nuevos errores
3. **Intentar en modo incógnito** del navegador
4. **Verificar conexión a Firebase** (puede estar bloqueada)

## 📞 CREDENCIALES DEMO

**Instructor:**
- Email: admin@softzen.com  
- Contraseña: SoftZen2024

**Paciente:**
- Email: paciente@softzen.com
- Contraseña: SoftZen2024

---

⚡ **EJECUTA LA LIMPIEZA AHORA PARA RESOLVER EL PROBLEMA**
