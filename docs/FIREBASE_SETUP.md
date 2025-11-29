# 🔥 Guía de Configuración de Firebase

## Problema Actual
El token de autenticación de Firebase estaba corrupto/expirado.

## Solución: Re-autenticación

### Paso 1: Volver a autenticarse
```powershell
firebase login
```
Esto abrirá tu navegador para autorizar de nuevo.

### Paso 2: Vincular el proyecto
```powershell
firebase use --add
```
Selecciona tu proyecto de la lista (probablemente algo como `copy-app` o similar).

### Paso 3: Desplegar los índices
```powershell
firebase deploy --only firestore:indexes
```

### Paso 4 (Opcional): Desplegar reglas de seguridad
```powershell
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Archivos Creados
- ✅ `firebase.json` - Configuración principal
- ✅ `firestore.rules` - Reglas de seguridad de Firestore
- ✅ `storage.rules` - Reglas de seguridad de Storage
- ✅ `firestore.indexes.json` - Índices compuestos

## Verificación
Una vez desplegados los índices, puedes verlos en:
https://console.firebase.google.com/project/_/firestore/indexes
