# 📌 Protocolo Estándar de Inicialización, Commits y Creación de Repos (Autor principal: **Renzo Colman**)

> Objetivo: estandarizar la creación y contribución a nuevos repos, garantizando que **Renzo Colman** quede como **autor principal** en cada commit y que **cada agente** quede registrado como **colaborador**.  
> Regla de oro: **primero `git init`**, después registrar identidad del proyecto con los datos de Renzo.

---

## 0) Variables de entorno (completar por el agente en cada repo)
- `AGENT_NAME`  → Nombre del agente colaborador (ej.: `Nefario`)
- `AGENT_EMAIL` → Correo del agente colaborador (ej.: `nefario@intellia.online`)

**PowerShell (Windows, una sola línea):**
$env:AGENT_NAME="Nefario"; $env:AGENT_EMAIL="nefario@intellia.online"

**Bash (WSL/Linux/Mac):**
export AGENT_NAME="Nefario"; export AGENT_EMAIL="nefario@intellia.online"

---

## 1) Inicialización obligatoria del repositorio
**PowerShell (Windows, una sola línea):**
git init; git config --local init.defaultBranch main; git checkout -b main

**Bash:**
git init && git config --local init.defaultBranch main && git checkout -b main

---

## 2) Registrar identidad del proyecto con las credenciales de Renzo (repo-local)
**PowerShell (Windows, una sola línea):**
git config user.name "Renzo Colman"; git config user.email "rcolman@intelia.online"

**Bash:**
git config user.name "Renzo Colman" && git config user.email "rcolman@intelia.online"

> Nota: esto **no** cambia la configuración global del equipo; solo define la autoría del proyecto en este repo.

---

## 3) Plantilla de mensaje de commit (estructura uniforme)
Crear `.gitmessage.txt` en la raíz del repo con este contenido:

[TYPE]: breve resumen (imperativo, ≤72 chars)  
[CONTEXT]: ¿qué problema resuelve?  
[SCOPE]: módulo/área afectada  
[DETAILS]: puntos clave del cambio, riesgos, testing  

Co-authored-by: ${AGENT_NAME} <${AGENT_EMAIL}>  
Signed-off-by: Renzo Colman <rcolman@intelia.online>  

Activar la plantilla del commit:

**PowerShell (Windows, una sola línea):**
git config commit.template ".gitmessage.txt"

**Bash:**
git config commit.template ".gitmessage.txt"

---

## 4) Hook para asegurar coautoría y firma (auto-append si faltan)
Crear `.git/hooks/prepare-commit-msg` (dar permisos de ejecución en Bash).  

**Contenido del hook:**
#!/usr/bin/env bash
set -euo pipefail
MSG_FILE="$1"
COAUTHOR_LINE="Co-authored-by: ${AGENT_NAME:-AGENT_NAME_NOT_SET} <${AGENT_EMAIL:-AGENT_EMAIL_NOT_SET}>"
SIGNEDOFF_LINE="Signed-off-by: Renzo Colman <rcolman@intelia.online>"

grep -qE '^Co-authored-by:' "$MSG_FILE" || printf "\n%s\n" "$COAUTHOR_LINE" >> "$MSG_FILE"
grep -qE '^Signed-off-by:' "$MSG_FILE" || printf "%s\n" "$SIGNEDOFF_LINE" >> "$MSG_FILE"

**PowerShell (Windows, una sola línea):**
bash -lc "chmod +x .git/hooks/prepare-commit-msg"

**Bash:**
chmod +x .git/hooks/prepare-commit-msg

---

## 5) Flujo de commit **recomendado** (autor principal = Renzo; colaborador = agente)
1) Indexar cambios:
   - **PowerShell:** git add -A
   - **Bash:** git add -A

2) Realizar el commit con autoría de Renzo y coautoría del agente:
   - **PowerShell (una sola línea):**
git commit -m "feat: initial project scaffold" --author "Renzo Colman <rcolman@intelia.online>" -m ("[CONTEXT]: bootstrap del repositorio") -m ("[SCOPE]: core") -m ("[DETAILS]: estructura mínima y tooling") -m ("Co-authored-by: {0} <{1}>" -f $env:AGENT_NAME,$env:AGENT_EMAIL) -m "Signed-off-by: Renzo Colman <rcolman@intelia.online>"

   - **Bash:**
git commit -m "feat: initial project scaffold" --author "Renzo Colman <rcolman@intelia.online>" -m "[CONTEXT]: bootstrap del repositorio" -m "[SCOPE]: core" -m "[DETAILS]: estructura mínima y tooling" -m "Co-authored-by: ${AGENT_NAME} <${AGENT_EMAIL}>" -m "Signed-off-by: Renzo Colman <rcolman@intelia.online>"

---

## 6) Creación de repositorio en GitHub (cuando Renzo lo solicite)
- Usuario: **intellia1**  
- Por defecto: **repositorios privados**  
- Solo se crean públicos si Renzo lo indica expresamente.  

**PowerShell (Windows, una sola línea):**
gh repo create intellia1/<NOMBRE_REPO> --private --confirm; git remote add origin https://github.com/intellia1/<NOMBRE_REPO>.git; git push -u origin main

**Bash:**
gh repo create intellia1/<NOMBRE_REPO> --private --confirm && git remote add origin https://github.com/intellia1/<NOMBRE_REPO>.git && git push -u origin main

> Si Renzo indica "crear repo público", sustituir `--private` por `--public`.

---

## 7) Política de comunicación y contenido
- **Autorización**: Renzo Colman es **autor principal**.  
- **Transparencia**: cada commit debe incluir `Co-authored-by: ${AGENT_NAME} <${AGENT_EMAIL}>`.  
- **Prohibición estricta**: **no** mencionar nombres de terceros ni herramientas externas en mensajes de commit, documentación interna del repo, issues o PRs. La presencia de tales referencias invalida la consistencia del proceso. Ejemplos de referencias prohibidas: `GitHub Copilot`, `ChatGPT`, `Claude`, `Claude Code`, `Bard`, `Gemini`, `Gemini CLI`, `Codex CLI`, etc.
- **Estilo de mensaje**: `[TYPE]` (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `build`, `ci`) + detalles.

---

## 8) Checklist de cumplimiento por commit
- [ ] ¿Se usó `--author "Renzo Colman <rcolman@intelia.online>"`?  
- [ ] ¿Incluye `Co-authored-by: ${AGENT_NAME} <${AGENT_EMAIL}>`?  
- [ ] ¿Incluye `Signed-off-by: Renzo Colman <rcolman@intelia.online>`?  
- [ ] ¿Se evitó toda referencia prohibida?  
- [ ] ¿Mensaje con `[TYPE]` + contexto/scope/detalles?

---

## 9) Ejemplo mínimo (PowerShell, una sola línea)
$env:AGENT_NAME="Nefario"; $env:AGENT_EMAIL="nefario@intellia.online"; git init; git config --local init.defaultBranch main; git checkout -b main; git config user.name "Renzo Colman"; git config user.email "rcolman@intelia.online"; git add -A; git commit -m "feat: seed project" --author "Renzo Colman <rcolman@intelia.online>" -m "[CONTEXT]: arranque del repo" -m "[SCOPE]: base" -m "[DETAILS]: archivos iniciales" -m ("Co-authored-by: {0} <{1}>" -f $env:AGENT_NAME,$env:AGENT_EMAIL) -m "Signed-off-by: Renzo Colman <rcolman@intelia.online>"; gh repo create intellia1/demo-repo --private --confirm; git remote add origin https://github.com/intellia1/demo-repo.git; git push -u origin main

---

## 10) Nota de control
- Este protocolo es **obligatorio** en **cada proyecto**.  
- Cualquier excepción requiere aprobación explícita de **Renzo Colman**.
