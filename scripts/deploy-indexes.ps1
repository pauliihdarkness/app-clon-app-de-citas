# Script para desplegar índices de Firestore (PowerShell)
# Asegúrate de tener Firebase CLI instalado: npm install -g firebase-tools

Write-Host "🔥 Desplegando índices de Firestore..." -ForegroundColor Cyan

# Verificar si Firebase CLI está instalado
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "❌ Error: Firebase CLI no está instalado." -ForegroundColor Red
    Write-Host "Instálalo con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Verificar si el usuario está autenticado
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Cyan
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás autenticado. Ejecuta: firebase login" -ForegroundColor Red
    exit 1
}

# Desplegar índices
Write-Host "📤 Desplegando índices desde firestore.indexes.json..." -ForegroundColor Cyan
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Índices desplegados exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Puedes ver tus índices en:" -ForegroundColor Cyan
    Write-Host "https://console.firebase.google.com/project/_/firestore/indexes" -ForegroundColor Blue
} else {
    Write-Host "❌ Error al desplegar índices." -ForegroundColor Red
    exit 1
}
