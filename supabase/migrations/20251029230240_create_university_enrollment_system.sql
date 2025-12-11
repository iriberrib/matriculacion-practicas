/*
  # Sistema de Matriculación Universitaria

  ## Descripción General
  Sistema completo para gestión de matriculación de estudiantes, materias y carreras
  universitarias desde la perspectiva del Administrador de Facultad.

  ## 1. Tablas Principales

  ### students (Estudiantes)
  - `id` (uuid, PK): Identificador único autogenerado e inmutable
  - `first_name` (text): Nombre del estudiante
  - `last_name` (text): Apellido del estudiante
  - `dni` (text, unique): Documento Nacional de Identidad
  - `birth_date` (date): Fecha de nacimiento
  - `current_career_id` (uuid, FK): Carrera actual del estudiante
  - `created_at` (timestamptz): Fecha de creación del registro
  - `updated_at` (timestamptz): Última actualización del registro

  ### subjects (Materias)
  - `id` (uuid, PK): Identificador único autogenerado e inmutable
  - `name` (text): Nombre de la materia
  - `semester` (integer): Cuatrimestre (1 o 2)
  - `year` (integer): Año académico al que pertenece
  - `capacity` (integer): Capacidad máxima de alumnos
  - `current_enrollment` (integer): Cantidad actual de alumnos inscriptos
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Última actualización

  ### careers (Carreras)
  - `id` (uuid, PK): Identificador único autogenerado e inmutable
  - `title` (text): Título de la carrera
  - `total_semesters` (integer): Total de cuatrimestres
  - `total_years` (integer): Total de años de la carrera
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Última actualización

  ### career_subjects (Materias asignadas a Carreras)
  - `id` (uuid, PK): Identificador único
  - `career_id` (uuid, FK): Referencia a la carrera
  - `subject_id` (uuid, FK): Referencia a la materia
  - `year` (integer): Año en que se cursa dentro de la carrera
  - `semester` (integer): Cuatrimestre en que se cursa
  - `created_at` (timestamptz): Fecha de creación

  ### enrollments (Inscripciones de estudiantes a materias)
  - `id` (uuid, PK): Identificador único
  - `student_id` (uuid, FK): Referencia al estudiante
  - `subject_id` (uuid, FK): Referencia a la materia
  - `enrollment_date` (timestamptz): Fecha de inscripción
  - `status` (text): Estado ('active', 'completed', 'dropped')
  - `created_at` (timestamptz): Fecha de creación

  ### career_history (Historial de carreras del estudiante)
  - `id` (uuid, PK): Identificador único
  - `student_id` (uuid, FK): Referencia al estudiante
  - `career_id` (uuid, FK): Referencia a la carrera
  - `start_date` (timestamptz): Fecha de inicio en la carrera
  - `end_date` (timestamptz, nullable): Fecha de finalización
  - `is_current` (boolean): Indica si es la carrera actual
  - `created_at` (timestamptz): Fecha de creación

  ### deleted_ids_log (Registro de IDs eliminados)
  - `id` (uuid, PK): Identificador único del log
  - `entity_type` (text): Tipo de entidad ('student', 'subject', 'career')
  - `deleted_id` (uuid): ID que fue eliminado
  - `deleted_at` (timestamptz): Fecha de eliminación

  ## 2. Reglas de Negocio Implementadas

  - Los IDs son UUID autogenerados y nunca se reutilizan
  - Los estudiantes solo pueden estar en una carrera activa
  - Las materias tienen capacidad limitada validada por trigger
  - El cambio de carrera se registra en el historial
  - Las inscripciones tienen estados para control del ciclo de vida

  ## 3. Seguridad (RLS)

  - Todas las tablas tienen RLS habilitado
  - Solo usuarios autenticados pueden acceder a los datos
  - Políticas restrictivas por defecto
*/

-- ============================================================================
-- TABLA: careers (Carreras)
-- ============================================================================
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  total_semesters integer NOT NULL CHECK (total_semesters > 0),
  total_years integer NOT NULL CHECK (total_years > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLA: students (Estudiantes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text UNIQUE NOT NULL,
  birth_date date NOT NULL CHECK (birth_date < CURRENT_DATE),
  current_career_id uuid REFERENCES careers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLA: subjects (Materias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  year integer NOT NULL CHECK (year > 0),
  capacity integer NOT NULL CHECK (capacity > 0),
  current_enrollment integer DEFAULT 0 CHECK (current_enrollment >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT enrollment_capacity_check CHECK (current_enrollment <= capacity)
);

-- ============================================================================
-- TABLA: career_subjects (Materias por Carrera)
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  year integer NOT NULL CHECK (year > 0),
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(career_id, subject_id)
);

-- ============================================================================
-- TABLA: enrollments (Inscripciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id, status)
);

-- ============================================================================
-- TABLA: career_history (Historial de Carreras)
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (end_date IS NULL OR end_date > start_date)
);

-- ============================================================================
-- TABLA: deleted_ids_log (Registro de IDs Eliminados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deleted_ids_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('student', 'subject', 'career')),
  deleted_id uuid NOT NULL,
  deleted_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ÍNDICES para optimización de consultas
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_dni ON students(dni);
CREATE INDEX IF NOT EXISTS idx_students_current_career ON students(current_career_id);
CREATE INDEX IF NOT EXISTS idx_career_subjects_career ON career_subjects(career_id);
CREATE INDEX IF NOT EXISTS idx_career_subjects_subject ON career_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_career_history_student ON career_history(student_id);
CREATE INDEX IF NOT EXISTS idx_career_history_current ON career_history(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_deleted_ids_entity ON deleted_ids_log(entity_type, deleted_id);

-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON careers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Validar capacidad de materia antes de inscribir
-- ============================================================================
CREATE OR REPLACE FUNCTION check_subject_capacity()
RETURNS TRIGGER AS $$
DECLARE
  subject_capacity integer;
  subject_enrollment integer;
BEGIN
  SELECT capacity, current_enrollment INTO subject_capacity, subject_enrollment
  FROM subjects WHERE id = NEW.subject_id;
  
  IF NEW.status = 'active' AND subject_enrollment >= subject_capacity THEN
    RAISE EXCEPTION 'La materia ha alcanzado su capacidad máxima';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_enrollment_capacity BEFORE INSERT OR UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION check_subject_capacity();

-- ============================================================================
-- TRIGGER: Actualizar contador de inscripciones en materias
-- ============================================================================
CREATE OR REPLACE FUNCTION update_subject_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE subjects SET current_enrollment = current_enrollment + 1
    WHERE id = NEW.subject_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE subjects SET current_enrollment = current_enrollment - 1
      WHERE id = NEW.subject_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE subjects SET current_enrollment = current_enrollment + 1
      WHERE id = NEW.subject_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE subjects SET current_enrollment = current_enrollment - 1
    WHERE id = OLD.subject_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enrollment_count 
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_subject_enrollment_count();

-- ============================================================================
-- TRIGGER: Registrar IDs eliminados
-- ============================================================================
CREATE OR REPLACE FUNCTION log_deleted_id()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deleted_ids_log (entity_type, deleted_id)
  VALUES (TG_ARGV[0], OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_deleted_student BEFORE DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION log_deleted_id('student');

CREATE TRIGGER log_deleted_subject BEFORE DELETE ON subjects
  FOR EACH ROW EXECUTE FUNCTION log_deleted_id('subject');

CREATE TRIGGER log_deleted_career BEFORE DELETE ON careers
  FOR EACH ROW EXECUTE FUNCTION log_deleted_id('career');

-- ============================================================================
-- TRIGGER: Gestionar historial de carreras
-- ============================================================================
CREATE OR REPLACE FUNCTION manage_career_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_career_id IS NOT NULL AND 
     (OLD.current_career_id IS NULL OR OLD.current_career_id != NEW.current_career_id) THEN
    
    -- Finalizar carrera anterior si existe
    IF OLD.current_career_id IS NOT NULL THEN
      UPDATE career_history 
      SET end_date = now(), is_current = false
      WHERE student_id = NEW.id AND is_current = true;
    END IF;
    
    -- Registrar nueva carrera
    INSERT INTO career_history (student_id, career_id, start_date, is_current)
    VALUES (NEW.id, NEW.current_career_id, now(), true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_student_career_history 
  AFTER UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION manage_career_history();

-- ============================================================================
-- SEGURIDAD: Row Level Security (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_ids_log ENABLE ROW LEVEL SECURITY;

-- Políticas para students
CREATE POLICY "Authenticated users can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para subjects
CREATE POLICY "Authenticated users can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para careers
CREATE POLICY "Authenticated users can view careers"
  ON careers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert careers"
  ON careers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update careers"
  ON careers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete careers"
  ON careers FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para career_subjects
CREATE POLICY "Authenticated users can view career subjects"
  ON career_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert career subjects"
  ON career_subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update career subjects"
  ON career_subjects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete career subjects"
  ON career_subjects FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para enrollments
CREATE POLICY "Authenticated users can view enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete enrollments"
  ON enrollments FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para career_history
CREATE POLICY "Authenticated users can view career history"
  ON career_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert career history"
  ON career_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update career history"
  ON career_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete career history"
  ON career_history FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para deleted_ids_log
CREATE POLICY "Authenticated users can view deleted IDs log"
  ON deleted_ids_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deleted IDs log"
  ON deleted_ids_log FOR INSERT
  TO authenticated
  WITH CHECK (true);