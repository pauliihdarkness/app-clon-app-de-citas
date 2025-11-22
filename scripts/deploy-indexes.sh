#!/bin/bash

# Script para desplegar índices de Firestore
# Asegúrate de tener Firebase CLI instalado: npm install -g firebase-tools

echo "🔥 Desplegando índices de Firestore..."

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Error: Firebase CLI no está instalado."
    echo "Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar si el usuario está autenticado
echo "🔐 Verificando autenticación..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ No estás autenticado. Ejecuta: firebase login"
    exit 1
fi

# Desplegar índices
echo "📤 Desplegando índices desde firestore.indexes.json..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Índices desplegados exitosamente!"
    echo ""
    echo "📊 Puedes ver tus índices en:"
    echo "https://console.firebase.google.com/project/_/firestore/indexes"
else
    echo "❌ Error al desplegar índices."
    exit 1
fi
