## Runner self-hosted — guía rápida

Si tu cuenta de GitHub Actions está bloqueada por facturación (jobs fallan con "account is locked due to a billing issue"), una alternativa rápida es ejecutar los jobs en un *runner self-hosted* (tu máquina). Esto evita depender de los minutos/creditos de GitHub.

Resumen de pasos (Windows):

1. En GitHub -> tu repositorio -> Settings -> Actions -> Runners -> New self-hosted runner. Selecciona **Windows** y copia las instrucciones de registro (token temporal).

2. En la máquina donde quieras ejecutar el runner (puede ser tu PC local), crea una carpeta, por ejemplo `C:\actions-runner`.

3. Descarga el paquete del runner (instrucciones que GitHub mostrará) y extrae.

4. Desde PowerShell (ejecutar como administrador) ejecuta los pasos que GitHub te da, por ejemplo:

```powershell
# Dentro de C:\actions-runner
\.\config.cmd --url https://github.com/<owner>/<repo> --token <YOUR_TOKEN>
# Luego instalar como servicio (opcional)
\.\svc.sh install
\.\svc.sh start
```

5. Verifica en GitHub que el runner aparece como `online`. Ahora los workflows que especifiquen `runs-on: self-hosted` podrán ejecutarse en tu runner.

Seguridad y recomendaciones:
- El token de registro es temporal — úsalo solo en la máquina de confianza.
- Mantén el runner actualizado (GitHub publica nuevas versiones).
- Si el runner correrá en un servidor público, revisa permisos y límites de red.

Qué hice en este repo:
- Añadí un workflow alternativo (`.github/workflows/lint-self-hosted.yml`) que usa `runs-on: self-hosted` para que puedas ejecutar lint desde tu propio runner si lo configuras.
