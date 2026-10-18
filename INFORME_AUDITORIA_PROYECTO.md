# INFORME DE AUDITORÍA INTEGRAL DE SEGURIDAD Y ARQUITECTURA
**Proyecto:** Remotion AI Video Generator (`vacaculiao`)  
**Fecha:** 18 de Octubre de 2026  
**Herramientas & Frameworks:** `hackmyagent` (OASB-2 / NanoMind AST), `auditor-skill` v7.3 (Checklists 08, 09, 11, 12, 13)  
**Calificación de Seguridad Inicial:** 93/100 (HackMyAgent)  
**Estado:** Usable con advertencias / Listo para endurecimiento (Hardening)

---

## 1. Resumen Ejecutivo

Se auditó la totalidad de la base de código del generador de video animado con Remotion (`src/`, scripts, dependencias y configuraciones de entorno). El proyecto presenta un diseño modular desacoplado y tipos estrictos (`strict: true`), libre de tipos `any` y con renderizado determinista puro.

No se detectaron vulnerabilidades críticas de ejecución remota arbitraria (RCE) incondicional ni inyecciones de código directo en Remotion (`eval` / `new Function` ausentes). Sin embargo, se identificaron **4 vectores de riesgo preventivo** catalogados entre severidad Media y Baja:
1. **[MEDIO] Sanitización del identificador de archivo en proceso secundario (`spawn`)**: Riesgo de colisión de archivos o path traversal si `scene.id` proviene de un input no confiable.
2. **[MEDIO] Aislamiento de ejecución y límites de recursos en Render**: La renderización con Chromium Headless carece de sandbox de contenedor y cuotas de memoria/tiempo límite en ejecución masiva.
3. **[BAJO] Higiene de `.gitignore`**: Falta de patrones preventivos explícitos para claves de API (`.env*`, `*.pem`, `secrets.json`).
4. **[BAJO] Validación en tiempo de ejecución (Runtime Schemas)**: Ausencia de validación con `zod` al deserializar la salida JSON del subproceso Python.

---

## 2. Resultados de Escáner Agéntico Automatizado (`hackmyagent`)

```
Discovering assembly components...
  remotion-ai-video-generator v1.0.0 · webapp · 11 files analyzed
  Security Score: 93/100

  Coverage: 18 of 25 categories examined (318 static checks declared)
  Verdicts: 1 Medium, 1 Low, 16 Categories Clear
```

### Hallazgos de HackMyAgent:
- **LOW — Incomplete `.gitignore`**: No existen archivos de claves committeados actualmente, pero el archivo `.gitignore` debe incluir preventivamente patrones de secretos (`.env`, `*.pem`, `*.key`, `secrets.json`).
- **MEDIUM — Container Isolation**: La aplicación ejecuta procesos de renderizado intensivo y subprocesos del SO directamente sobre el host sin aislamiento en contenedor Docker.

---

## 3. Matriz de Verificación `auditor-skill` (Checklists 08 & 09)

| Código | Descripción del Control | Veredicto | Detalle / Justificación Técnica |
|---|---|---|---|
| **TS-001** | Prohibición estricta de `: any` | **[PASS]** | 0 ocurrencias en todo el directorio `src/`. |
| **TS-002** | Prohibición de `as any` | **[PASS]** | 0 ocurrencias. Tipado riguroso con interfaces TypeScript. |
| **TS-011** | Manejo de excepciones en catch | **[PASS]** | Bloques catch tipan o propagan con contexto descriptivo. |
| **TS-022** | Prohibición de `require()` en código de app | **[PASS]** | Uso exclusivo de ESM (`import`). |
| **TS-027** | `tsconfig.json` con `strict: true` | **[PASS]** | Configurado en `tsconfig.json` con `NodeNext`. |
| **TS-053** | Prohibición de `eval()` o `new Function()` | **[PASS]** | No existen llamadas a evaluadores dinámicos. |
| **BE-016** | Prevención de Path Traversal | **[PARTIAL]** | `audio-${sceneId}.mp3` usa `sceneId` directamente. Si se expone vía API pública, un `sceneId` manipulado (`../../`) podría escapar de `public/`. |
| **BE-017** | Prevención de Command Injection | **[PASS]** | `spawn('python', ['-c', script, text, voice, path])` usa matriz de argumentos sin invocación a shell (`shell: false` por defecto). No hay concatenación en shell string. |
| **BE-037** | Fugas de datos y trazas internas | **[PASS]** | Salidas limpias sin exponer rutas sensibles en payloads. |

---

## 4. Plan de Acción y Mitigaciones Recomendadas

1. **Blindaje de `sceneId` en `TTSEngine`**:
   Sanitizar `sceneId` reemplazando caracteres no alfanuméricos (`sceneId.replace(/[^a-zA-Z0-9_-]/g, '')`) para impedir cualquier intento de path traversal.
2. **Validación Zod del JSON de TTS**:
   Implementar esquema zod para validar que la salida emitida por el script Python cumpla estrictamente con `{ durationMs: number, words: WordTimestamp[] }`.
3. **Completar `.gitignore`**:
   Agregar `.env*`, `*.pem`, `*.key` y `secrets.json`.
4. **Timeout y Buffer Guard en el Subproceso**:
   Configurar un `timeout: 30000` en el subproceso `spawn` para evitar procesos zombies si el servicio TTS sufre un hang de red.
