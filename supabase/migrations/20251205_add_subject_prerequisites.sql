/*
  # Subject Prerequisites (Correlatividades)
  
  ## Descripción
  Tabla para gestionar las correlatividades entre materias.
  Implementa una relación muchos-a-muchos de subjects consigo misma.
  
  ## Campos
  - id: Identificador único
  - subject_id: Materia que requiere el prerrequisito
  - prerequisite_subject_id: Materia que debe estar aprobada
  - created_at: Fecha de creación
  
  ## Reglas
  - Una materia no puede ser prerrequisito de sí misma
  - No se permiten duplicados (UNIQUE constraint)
  - Índices para optimizar consultas de grafo
*/

-- ============================================================================
-- TABLA: subject_prerequisites (Correlatividades)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subject_prerequisites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  prerequisite_subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(subject_id, prerequisite_subject_id),
  CHECK (subject_id != prerequisite_subject_id)
);

-- ============================================================================
-- ÍNDICES para optimización de consultas de grafo
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_prerequisites_subject 
  ON subject_prerequisites(subject_id);

CREATE INDEX IF NOT EXISTS idx_prerequisites_prerequisite 
  ON subject_prerequisites(prerequisite_subject_id);

-- Índice compuesto para consultas bidireccionales
CREATE INDEX IF NOT EXISTS idx_prerequisites_both 
  ON subject_prerequisites(subject_id, prerequisite_subject_id);

-- ============================================================================
-- SEGURIDAD: Row Level Security (RLS)
-- ============================================================================
ALTER TABLE subject_prerequisites ENABLE ROW LEVEL SECURITY;

-- Políticas para subject_prerequisites
CREATE POLICY "Authenticated users can view prerequisites"
  ON subject_prerequisites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert prerequisites"
  ON subject_prerequisites FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prerequisites"
  ON subject_prerequisites FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prerequisites"
  ON subject_prerequisites FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- DATOS DE EJEMPLO (Seed Data)
-- ============================================================================

-- Insertar materias de ejemplo si no existen
DO $$
BEGIN
  -- Año 1, Cuatrimestre 1
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Cálculo I', 1, 1, 50, 0)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Álgebra I', 1, 1, 50, 0)
  ON CONFLICT DO NOTHING;
  
  -- Año 1, Cuatrimestre 2
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Física I', 2, 1, 40, 0)
  ON CONFLICT DO NOTHING;
  
  -- Año 2, Cuatrimestre 1
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Cálculo II', 1, 2, 45, 0)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Álgebra II', 1, 2, 45, 0)
  ON CONFLICT DO NOTHING;
  
  -- Año 2, Cuatrimestre 2
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Física II', 2, 2, 40, 0)
  ON CONFLICT DO NOTHING;
  
  -- Año 3, Cuatrimestre 1
  INSERT INTO subjects (name, semester, year, capacity, current_enrollment)
  VALUES ('Cálculo III', 1, 3, 40, 0)
  ON CONFLICT DO NOTHING;
END $$;

-- Insertar correlatividades de ejemplo
DO $$
DECLARE
  calculo1_id uuid;
  calculo2_id uuid;
  calculo3_id uuid;
  algebra1_id uuid;
  algebra2_id uuid;
  fisica1_id uuid;
  fisica2_id uuid;
BEGIN
  -- Obtener IDs de las materias
  SELECT id INTO calculo1_id FROM subjects WHERE name = 'Cálculo I' LIMIT 1;
  SELECT id INTO calculo2_id FROM subjects WHERE name = 'Cálculo II' LIMIT 1;
  SELECT id INTO calculo3_id FROM subjects WHERE name = 'Cálculo III' LIMIT 1;
  SELECT id INTO algebra1_id FROM subjects WHERE name = 'Álgebra I' LIMIT 1;
  SELECT id INTO algebra2_id FROM subjects WHERE name = 'Álgebra II' LIMIT 1;
  SELECT id INTO fisica1_id FROM subjects WHERE name = 'Física I' LIMIT 1;
  SELECT id INTO fisica2_id FROM subjects WHERE name = 'Física II' LIMIT 1;
  
  -- Cálculo II requiere Cálculo I
  IF calculo1_id IS NOT NULL AND calculo2_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (calculo2_id, calculo1_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Cálculo III requiere Cálculo II
  IF calculo2_id IS NOT NULL AND calculo3_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (calculo3_id, calculo2_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Álgebra II requiere Álgebra I
  IF algebra1_id IS NOT NULL AND algebra2_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (algebra2_id, algebra1_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Física II requiere Cálculo I y Física I
  IF calculo1_id IS NOT NULL AND fisica2_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (fisica2_id, calculo1_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF fisica1_id IS NOT NULL AND fisica2_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (fisica2_id, fisica1_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Cálculo III requiere Álgebra II (correlatividad cruzada)
  IF algebra2_id IS NOT NULL AND calculo3_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id)
    VALUES (calculo3_id, algebra2_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
