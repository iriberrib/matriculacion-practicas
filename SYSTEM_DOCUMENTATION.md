# Sistema de Matriculación Universitaria
## Documentación Técnica y de Negocio

---

## 📋 Índice
1. [Modelo de Datos](#modelo-de-datos)
2. [Relaciones entre Entidades](#relaciones-entre-entidades)
3. [Reglas de Negocio](#reglas-de-negocio)
4. [Flujo de Matriculación](#flujo-de-matriculación)
5. [Restricciones Técnicas](#restricciones-técnicas)
6. [API REST Endpoints](#api-rest-endpoints)

---

## 🗄️ Modelo de Datos

### Entidades Principales

#### 1. **students** (Estudiantes)
```sql
{
  id: uuid (PK, autogenerado),
  first_name: text,
  last_name: text,
  dni: text (unique),
  birth_date: date,
  current_career_id: uuid (FK → careers),
  created_at: timestamptz,
  updated_at: timestamptz
}
```

**Propósito**: Almacena la información personal de los estudiantes inscritos en la universidad.

**Validaciones**:
- DNI debe ser único en el sistema
- Fecha de nacimiento debe ser anterior a la fecha actual
- Solo puede tener una carrera activa (`current_career_id`)

---

#### 2. **subjects** (Materias)
```sql
{
  id: uuid (PK, autogenerado),
  name: text,
  semester: integer (1 o 2),
  year: integer,
  capacity: integer,
  current_enrollment: integer,
  created_at: timestamptz,
  updated_at: timestamptz
}
```

**Propósito**: Define las materias disponibles en la universidad.

**Validaciones**:
- El cuatrimestre debe ser 1 o 2
- La capacidad debe ser mayor a 0
- Las inscripciones actuales no pueden exceder la capacidad
- El año debe ser positivo

---

#### 3. **careers** (Carreras)
```sql
{
  id: uuid (PK, autogenerado),
  title: text,
  total_semesters: integer,
  total_years: integer,
  created_at: timestamptz,
  updated_at: timestamptz
}
```

**Propósito**: Representa los programas académicos ofrecidos por la universidad.

**Validaciones**:
- Total de cuatrimestres y años deben ser positivos

---

#### 4. **career_subjects** (Materias por Carrera)
```sql
{
  id: uuid (PK, autogenerado),
  career_id: uuid (FK → careers),
  subject_id: uuid (FK → subjects),
  year: integer,
  semester: integer (1 o 2),
  created_at: timestamptz
}
```

**Propósito**: Relaciona las materias con las carreras, definiendo en qué año y cuatrimestre se cursan.

**Validaciones**:
- Una materia no puede estar asignada dos veces a la misma carrera (unique constraint)
- El año y cuatrimestre deben ser válidos

---

#### 5. **enrollments** (Inscripciones)
```sql
{
  id: uuid (PK, autogenerado),
  student_id: uuid (FK → students),
  subject_id: uuid (FK → subjects),
  enrollment_date: timestamptz,
  status: text ('active', 'completed', 'dropped'),
  created_at: timestamptz
}
```

**Propósito**: Registra las inscripciones de estudiantes a materias específicas.

**Validaciones**:
- Un estudiante no puede estar inscrito dos veces en la misma materia con el mismo estado
- El estado debe ser uno de: 'active', 'completed', 'dropped'

---

#### 6. **career_history** (Historial de Carreras)
```sql
{
  id: uuid (PK, autogenerado),
  student_id: uuid (FK → students),
  career_id: uuid (FK → careers),
  start_date: timestamptz,
  end_date: timestamptz (nullable),
  is_current: boolean,
  created_at: timestamptz
}
```

**Propósito**: Mantiene un historial completo de todos los cambios de carrera de un estudiante.

**Validaciones**:
- Solo puede haber una carrera con `is_current = true` por estudiante
- La fecha de fin debe ser posterior a la de inicio

---

#### 7. **deleted_ids_log** (Registro de IDs Eliminados)
```sql
{
  id: uuid (PK, autogenerado),
  entity_type: text ('student', 'subject', 'career'),
  deleted_id: uuid,
  deleted_at: timestamptz
}
```

**Propósito**: Garantiza que los IDs eliminados nunca se reutilicen, manteniendo la integridad histórica.

**Validaciones**:
- El tipo de entidad debe ser válido ('student', 'subject', 'career')

---

## 🔗 Relaciones entre Entidades

### Diagrama de Relaciones

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   careers   │          │  students   │          │  subjects   │
│             │◄────────┐│             │┌────────►│             │
│ id (PK)     │         ││ id (PK)     ││         │ id (PK)     │
│ title       │         ││ first_name  ││         │ name        │
│ ...         │         ││ dni         ││         │ capacity    │
└─────────────┘         │└─────────────┘│         └─────────────┘
      ▲                 │       ▲       │               ▲
      │                 │       │       │               │
      │                 │       │       │               │
      │   ┌─────────────┴───────┴───────┴─────────┐     │
      │   │                                        │     │
      │   │         career_history                 │     │
      │   │  - student_id (FK)                     │     │
      │   │  - career_id (FK)                      │     │
      │   │  - is_current                          │     │
      │   └────────────────────────────────────────┘     │
      │                                                   │
      │                                                   │
┌─────┴─────────────┐                     ┌──────────────┴──────┐
│ career_subjects   │                     │    enrollments      │
│                   │                     │                     │
│ career_id (FK)    │                     │ student_id (FK)     │
│ subject_id (FK)   │                     │ subject_id (FK)     │
│ year              │                     │ status              │
│ semester          │                     │ enrollment_date     │
└───────────────────┘                     └─────────────────────┘
```

### Tipos de Relaciones

1. **students ↔ careers** (N:1 actual, N:M histórica)
   - Un estudiante pertenece a UNA carrera activa
   - Un estudiante puede haber pertenecido a MÚLTIPLES carreras (histórico)

2. **students ↔ subjects** (N:M a través de enrollments)
   - Un estudiante puede inscribirse a MÚLTIPLES materias
   - Una materia puede tener MÚLTIPLES estudiantes (hasta su capacidad)

3. **careers ↔ subjects** (N:M a través de career_subjects)
   - Una carrera contiene MÚLTIPLES materias
   - Una materia puede pertenecer a MÚLTIPLES carreras

---

## 📜 Reglas de Negocio

### 1. Gestión de Estudiantes

#### Creación
- El DNI debe ser único en todo el sistema
- La fecha de nacimiento debe ser válida y anterior a la fecha actual
- Al crear un estudiante, se puede asignar directamente a una carrera

#### Actualización
- Se puede modificar cualquier campo excepto el `id`
- Si se cambia `current_career_id`, se registra automáticamente en `career_history`

#### Eliminación
- Al eliminar un estudiante:
  - Su ID se registra en `deleted_ids_log`
  - Se eliminan en cascada todas sus inscripciones
  - Se mantiene su historial de carreras

---

### 2. Gestión de Materias

#### Creación
- Se debe especificar: nombre, cuatrimestre (1 o 2), año, y capacidad máxima
- El contador de inscripciones inicia en 0

#### Actualización
- No se puede reducir la capacidad por debajo de las inscripciones actuales
- Se pueden modificar nombre, cuatrimestre, año

#### Eliminación
- Al eliminar una materia:
  - Su ID se registra en `deleted_ids_log`
  - Se eliminan en cascada todas las asignaciones a carreras
  - Se eliminan en cascada todas las inscripciones

---

### 3. Gestión de Carreras

#### Creación
- Se debe especificar título, total de cuatrimestres y años
- Una carrera puede crearse sin materias asignadas

#### Actualización
- Se pueden modificar todos los campos excepto el `id`
- Cambiar la duración no afecta las materias ya asignadas

#### Eliminación
- Al eliminar una carrera:
  - Su ID se registra en `deleted_ids_log`
  - Los estudiantes con `current_career_id` apuntando a ella quedan con `NULL`
  - Se eliminan en cascada todas las asignaciones de materias

---

### 4. Asignación de Materias a Carreras

#### Reglas
- Una materia solo puede asignarse UNA VEZ a cada carrera
- Se debe especificar el año y cuatrimestre dentro del plan de estudios
- Una materia puede pertenecer a múltiples carreras diferentes

#### Validaciones
- El año y cuatrimestre deben ser coherentes con la duración de la carrera

---

### 5. Inscripción de Estudiantes a Materias

#### Validación de Capacidad
- **CRÍTICO**: Antes de inscribir, se verifica que `current_enrollment < capacity`
- Si se alcanzó la capacidad, la inscripción se rechaza con error

#### Estados de Inscripción
- **active**: El estudiante está cursando actualmente
- **completed**: El estudiante completó la materia
- **dropped**: El estudiante abandonó la materia

#### Contador Automático
- Al crear inscripción con estado 'active': `current_enrollment += 1`
- Al cambiar estado de 'active' a otro: `current_enrollment -= 1`
- Al eliminar inscripción 'active': `current_enrollment -= 1`

---

### 6. Cambio de Carrera

#### Proceso Automático
- Al cambiar `current_career_id` de un estudiante:
  1. Se finaliza la carrera anterior en `career_history` (set `end_date`, `is_current = false`)
  2. Se crea un nuevo registro en `career_history` para la nueva carrera
  3. Solo una carrera puede tener `is_current = true` por estudiante

#### Restricciones
- Un estudiante solo puede tener UNA carrera activa simultáneamente
- El historial completo se preserva indefinidamente

---

## 🔄 Flujo de Matriculación

### Paso 1: Configuración Inicial del Sistema

```
1. Crear Carreras
   └─► INSERT INTO careers (title, total_semesters, total_years)

2. Crear Materias
   └─► INSERT INTO subjects (name, semester, year, capacity)

3. Asignar Materias a Carreras
   └─► INSERT INTO career_subjects (career_id, subject_id, year, semester)
```

---

### Paso 2: Registro de Estudiante

```
1. Validar DNI único

2. Crear estudiante
   └─► INSERT INTO students (first_name, last_name, dni, birth_date)

3. (Opcional) Asignar a carrera
   └─► UPDATE students SET current_career_id = ?
   └─► Trigger automático crea registro en career_history
```

---

### Paso 3: Inscripción a Materias

```
1. Verificar estudiante existe

2. Verificar materia existe y tiene capacidad disponible
   └─► SELECT capacity, current_enrollment FROM subjects WHERE id = ?
   └─► IF current_enrollment >= capacity → RECHAZAR

3. Crear inscripción
   └─► INSERT INTO enrollments (student_id, subject_id, status)
   └─► Trigger automático incrementa current_enrollment

4. Confirmar inscripción exitosa
```

**Diagrama de Flujo:**

```
┌─────────────────┐
│ Inicio          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      NO
│ Estudiante      ├──────────► ERROR: Estudiante no encontrado
│ existe?         │
└────────┬────────┘
         │ SÍ
         ▼
┌─────────────────┐      NO
│ Materia         ├──────────► ERROR: Materia no encontrada
│ existe?         │
└────────┬────────┘
         │ SÍ
         ▼
┌─────────────────┐      NO
│ Hay cupos       ├──────────► ERROR: Capacidad máxima alcanzada
│ disponibles?    │
└────────┬────────┘
         │ SÍ
         ▼
┌─────────────────┐
│ Inscripción     │
│ creada          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Contador +1     │
│ (automático)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FIN: Éxito      │
└─────────────────┘
```

---

### Paso 4: Gestión de Estados de Inscripción

```
Cambiar estado de inscripción:

1. De 'active' a 'completed'
   └─► UPDATE enrollments SET status = 'completed'
   └─► Trigger automático decrementa current_enrollment

2. De 'active' a 'dropped'
   └─► UPDATE enrollments SET status = 'dropped'
   └─► Trigger automático decrementa current_enrollment
   └─► Libera cupo para otro estudiante
```

---

### Paso 5: Cambio de Carrera

```
1. Verificar nueva carrera existe

2. Actualizar carrera del estudiante
   └─► UPDATE students SET current_career_id = ?

3. Trigger automático gestiona historial:
   ├─► Finalizar carrera anterior en career_history
   └─► Crear registro nuevo con is_current = true
```

---

## 🔒 Restricciones Técnicas sobre IDs

### Características de los IDs

1. **Tipo de Dato**: UUID (Universally Unique Identifier)
   - Generados automáticamente mediante `gen_random_uuid()`
   - 128 bits de longitud
   - Ejemplo: `550e8400-e29b-41d4-a716-446655440000`

2. **Inmutabilidad**: Los IDs NO pueden modificarse después de crearse

3. **Unicidad Global**: Cada ID es único en todo el sistema

4. **No Reutilización**: Los IDs eliminados NUNCA se reutilizan

---

### Sistema de Prevención de Reutilización

#### Tabla `deleted_ids_log`

Cada vez que se elimina un registro de `students`, `subjects` o `careers`:

```sql
TRIGGER log_deleted_id → INSERT INTO deleted_ids_log
```

**Ejemplo de registro:**
```json
{
  "id": "uuid-del-log",
  "entity_type": "student",
  "deleted_id": "550e8400-e29b-41d4-a716-446655440000",
  "deleted_at": "2025-10-29T14:30:00Z"
}
```

#### Verificación antes de crear/restaurar

Si en el futuro se implementara una funcionalidad de "restaurar", se debe verificar:

```sql
SELECT EXISTS (
  SELECT 1 FROM deleted_ids_log
  WHERE entity_type = 'student'
  AND deleted_id = ?
)
```

Si existe, se debe generar un NUEVO UUID en lugar de reutilizar el anterior.

---

### Ventajas de usar UUIDs

✅ **Independencia de secuencias**: No hay colisiones entre sistemas distribuidos
✅ **Seguridad**: Imposible predecir el siguiente ID
✅ **Escalabilidad**: Se pueden generar IDs en múltiples servidores sin coordinación
✅ **Integridad histórica**: Los IDs eliminados permanecen únicos para siempre

---

## 🌐 API REST Endpoints (Propuesta)

### Estudiantes

```http
GET    /api/students              # Listar todos los estudiantes
GET    /api/students/:id          # Obtener un estudiante
POST   /api/students              # Crear estudiante
PUT    /api/students/:id          # Actualizar estudiante
DELETE /api/students/:id          # Eliminar estudiante
GET    /api/students/:id/career-history  # Historial de carreras
```

### Materias

```http
GET    /api/subjects              # Listar todas las materias
GET    /api/subjects/:id          # Obtener una materia
POST   /api/subjects              # Crear materia
PUT    /api/subjects/:id          # Actualizar materia
DELETE /api/subjects/:id          # Eliminar materia
GET    /api/subjects/:id/enrollments     # Inscripciones de la materia
```

### Carreras

```http
GET    /api/careers               # Listar todas las carreras
GET    /api/careers/:id           # Obtener una carrera
POST   /api/careers               # Crear carrera
PUT    /api/careers/:id           # Actualizar carrera
DELETE /api/careers/:id           # Eliminar carrera
GET    /api/careers/:id/subjects  # Materias de la carrera
POST   /api/careers/:id/subjects  # Asignar materia a carrera
DELETE /api/careers/:id/subjects/:subject_id  # Desasignar materia
```

### Inscripciones

```http
GET    /api/enrollments           # Listar todas las inscripciones
POST   /api/enrollments           # Inscribir estudiante a materia
PUT    /api/enrollments/:id       # Cambiar estado de inscripción
DELETE /api/enrollments/:id       # Eliminar inscripción
```

**Ejemplo de body para crear inscripción:**
```json
{
  "student_id": "uuid-del-estudiante",
  "subject_id": "uuid-de-la-materia",
  "status": "active"
}
```

**Respuestas de error comunes:**
```json
{
  "error": "La materia ha alcanzado su capacidad máxima",
  "code": "CAPACITY_EXCEEDED"
}
```

---

## 📊 Consultas SQL Útiles

### Ver estudiantes con sus carreras actuales

```sql
SELECT
  s.id,
  s.first_name,
  s.last_name,
  s.dni,
  c.title as current_career
FROM students s
LEFT JOIN careers c ON s.current_career_id = c.id;
```

### Ver materias con cupos disponibles

```sql
SELECT
  id,
  name,
  semester,
  year,
  capacity,
  current_enrollment,
  (capacity - current_enrollment) as available_spots
FROM subjects
WHERE current_enrollment < capacity;
```

### Ver inscripciones activas por estudiante

```sql
SELECT
  s.first_name,
  s.last_name,
  sub.name as subject_name,
  e.enrollment_date,
  e.status
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN subjects sub ON e.subject_id = sub.id
WHERE s.id = ? AND e.status = 'active';
```

### Ver historial completo de carreras de un estudiante

```sql
SELECT
  c.title,
  ch.start_date,
  ch.end_date,
  ch.is_current
FROM career_history ch
JOIN careers c ON ch.career_id = c.id
WHERE ch.student_id = ?
ORDER BY ch.start_date DESC;
```

### Ver materias de una carrera por año y cuatrimestre

```sql
SELECT
  cs.year,
  cs.semester,
  s.name,
  s.capacity
FROM career_subjects cs
JOIN subjects s ON cs.subject_id = s.id
WHERE cs.career_id = ?
ORDER BY cs.year, cs.semester;
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Inscribir estudiante nuevo a su primera materia

```sql
-- 1. Crear estudiante
INSERT INTO students (first_name, last_name, dni, birth_date, current_career_id)
VALUES ('Juan', 'Pérez', '12345678', '2000-05-15', 'uuid-carrera')
RETURNING id;

-- 2. Inscribir a materia (verificando capacidad)
INSERT INTO enrollments (student_id, subject_id, status)
VALUES ('uuid-estudiante', 'uuid-materia', 'active');
```

### Caso 2: Cambiar estudiante de carrera

```sql
-- El trigger automáticamente:
-- - Finaliza la carrera anterior en career_history
-- - Crea nuevo registro con is_current = true

UPDATE students
SET current_career_id = 'uuid-nueva-carrera'
WHERE id = 'uuid-estudiante';
```

### Caso 3: Estudiante abandona una materia

```sql
-- El trigger automáticamente decrementa current_enrollment

UPDATE enrollments
SET status = 'dropped'
WHERE student_id = 'uuid-estudiante'
AND subject_id = 'uuid-materia'
AND status = 'active';
```

---

## ✅ Checklist de Implementación

- [x] Modelo de datos diseñado
- [x] Relaciones entre entidades definidas
- [x] Triggers para actualización automática de timestamps
- [x] Triggers para validación de capacidad
- [x] Triggers para contador de inscripciones
- [x] Triggers para registro de IDs eliminados
- [x] Triggers para gestión de historial de carreras
- [x] Índices optimizados para consultas frecuentes
- [x] Row Level Security (RLS) habilitado
- [x] Políticas de seguridad configuradas
- [x] Constraints de integridad referencial
- [x] Validaciones de datos a nivel de base de datos

---

## 🚀 Próximos Pasos Sugeridos

1. **Frontend**: Implementar interfaz de administración con React
2. **API**: Crear endpoints con validación y manejo de errores
3. **Reportes**: Sistema de generación de reportes académicos
4. **Notificaciones**: Alertas cuando materias estén por llenarse
5. **Dashboard**: Panel con estadísticas y métricas del sistema
6. **Exportación**: Funcionalidad para exportar datos a CSV/Excel
7. **Auditoría**: Sistema de logs de todas las operaciones críticas

---

**Documentación generada**: 2025-10-29
**Versión del sistema**: 1.0.0
