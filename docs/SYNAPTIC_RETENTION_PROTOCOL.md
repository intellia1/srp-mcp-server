# Synaptic Retention Protocol (SRP)
## Sistema MCP de Retención de Memoria Sináptica para Agentes de IA

---

## Descripción General

El **Synaptic Retention Protocol (SRP)** es un servidor Model Context Protocol (MCP) diseñado para funcionar como un soporte de memoria distribuida destinado a agentes de IA que ejecutan tareas excesivamente largas y complejas, compuestas por múltiples subtareas con gran cantidad de detalles en cada una de ellas.

### Objetivo Principal

Garantizar que los agentes no pierdan contexto crítico, incluso cuando se ejecuta la compactación de la ventana de contexto conversacional. El sistema debe preservar detalles importantes que resultan cruciales para:

- Elaboración de informes y reportes
- Continuación de tareas dependientes
- Mantenimiento de coherencia en proyectos extensos
- Generación de entregables completos y precisos

---

## Enfoque de Implementación

El SRP adopta un **triple enfoque** diseñado para ser funcional mientras no esté implementado completamente el sistema Cognitium. Los tres componentes del enfoque son:

### 1. Sistema de Herramientas de Notas Estructuradas

El primer componente implementa un sistema de herramientas que permite a los agentes tomar apuntes y notas estructuradas de manera similar a como lo haría un humano, pero con una arquitectura específicamente diseñada para relacionar estas notas con tareas concretas.

#### Modelo de Datos

**Entidad: Tarea**
- `task_id`: Identificador único de la tarea
- `title`: Título descriptivo de la tarea
- `description`: Descripción detallada de la tarea
- `notes`: Estructura JSON generada dinámicamente por el agente

**Estructura de Notas**

Las notas deben registrarse en el siguiente formato JSON estandarizado:

```json
{
  "note_id": "note_20251005_001",
  "agent_id": "algorio",
  "task_id": "session_20251005_001",
  "timestamp": "2025-10-05T14:32:19Z",
  "task_title": "Implement authentication login endpoint",
  "subtask_id": "subtask_20251005_001",
  "subtask_title": "Create POST /api/login handler and tests",
  "content": "Implement a secure login endpoint that validates user credentials, returns a JWT on success, and includes unit tests for success and failure cases.",
  "subtask_status": "in_progress",
  "public_state": true
}
```

**Campos de la Estructura de Notas:**

- `note_id`: Identificador único de la nota (formato: note_YYYYMMDD_NNN)
- `agent_id`: Identificador del agente que registra la nota
- `task_id`: Identificador de la sesión o tarea principal (formato: session_YYYYMMDD_NNN)
- `timestamp`: Marca temporal en formato ISO 8601
- `task_title`: Título de la tarea principal
- `subtask_id`: Identificador de la subtarea específica (formato: subtask_YYYYMMDD_NNN)
- `subtask_title`: Título de la subtarea
- `content`: Contenido descriptivo de la nota con los detalles relevantes
- `subtask_status`: Estado actual de la subtarea (valores posibles: "pending", "in_progress", "completed", "blocked")
- `public_state`: Booleano que indica si la nota es visible públicamente o es privada del agente

#### Funcionamiento

El agente genera un JSON estructurado a medida que completa cada subtarea dentro de una estructura de desglose de trabajo (WBS - Work Breakdown Structure). El proceso funciona de la siguiente manera:

1. **Durante la Ejecución**: Si una tarea A contiene las subtareas A.1, A.2 y A.3, el agente debe tomar notas progresivamente:
   - Al completar o incluso al analizar la subtarea A.1, registra sus notas
   - Repite el proceso con A.2
   - Continúa con A.3

2. **En Caso de Compactación de Contexto**: Si durante el proceso de ejecución se compacta la ventana de contexto, no hay pérdida de información porque el agente puede:
   - Recurrir a los apuntes estructurados almacenados
   - Reconstruir el contexto mnemónico desde las notas
   - Continuar con la tarea sin interrupciones
   - Generar los entregables completos sin pérdida de información

### 2. Hook de Pre-Compactación con Notificación al Usuario

El segundo componente implementa un mecanismo de interceptación que se activa antes de ejecutar la compactación del contexto.

#### Funcionamiento

1. **Detección**: El sistema detecta que está próxima una compactación de contexto
2. **Notificación**: Se dispara una instrucción automática al agente para que informe al usuario sobre:
   - Qué contenido específico está por ser compactado
   - Qué información será removida de la memoria activa
3. **Decisión del Usuario**: El usuario puede entonces especificar:
   - Qué elementos priorizar y mantener sin compactar
   - Qué información puede ser compactada de manera segura
   - Qué elementos deben preservarse en la memoria contextual activa

Este enfoque permite mantener información relevante sin compactar dentro de la memoria contextual, con supervisión humana directa.

### 3. Orquestador de Análisis Pre-Tarea (Depreciado)

El tercer componente propuesto consiste en un orquestador o sistema de análisis con umbral que opera antes de la compactación del contexto.

#### Funcionamiento Propuesto

El sistema evaluaría:
- Cuánto espacio de contexto queda disponible antes de la compactación
- Si es conveniente iniciar las tareas inmediatamente
- Si es preferible esperar a que se compacte el contexto antes de comenzar

#### Nota de Implementación

**Este enfoque es considerado el menos recomendable** por las siguientes razones:

- Cuando se inicien las tareas después de una compactación, el agente dispondrá de menos contexto previo
- La pérdida de contexto inicial puede comprometer la calidad de ejecución
- Se recomienda **descartar este componente en una primera fase de implementación**

---

## Estrategia de Implementación Recomendada

Para la implementación inicial del SRP, se recomienda priorizar:

1. **Componente 1**: Sistema de Herramientas de Notas Estructuradas
2. **Componente 2**: Hook de Pre-Compactación con Notificación al Usuario

El **Componente 3** debe quedar fuera del alcance inicial y considerarse para fases posteriores solo si se demuestra necesario y puede mitigarse el problema de pérdida de contexto.

---

## Beneficios del Sistema

- **Continuidad**: Los agentes pueden mantener coherencia en tareas largas sin importar las compactaciones de contexto
- **Precisión**: Se preservan detalles críticos que de otro modo se perderían
- **Control del Usuario**: Supervisión humana sobre qué información preservar
- **Flexibilidad**: Sistema modular que puede evolucionar hacia el Cognitium completo
- **Eficiencia**: Reducción de reintentos y correcciones por pérdida de contexto