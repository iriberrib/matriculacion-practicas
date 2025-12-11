/*
  # Carga de Datos Realistas - Carrera de Informática
  
  Este script carga todas las materias de la carrera de Ingeniería en Informática
  de 5 años con sus correlatividades correspondientes.
  
  Total: 60 materias distribuidas en 10 cuatrimestres
*/

-- ============================================================================
-- LIMPIAR DATOS ANTERIORES (OPCIONAL - COMENTAR SI NO SE DESEA)
-- ============================================================================
-- DELETE FROM subject_prerequisites;
-- DELETE FROM subjects WHERE name NOT IN ('Cálculo I', 'Cálculo II', 'Cálculo III', 'Álgebra I', 'Álgebra II', 'Física I', 'Física II');

-- ============================================================================
-- 1º AÑO - PRIMER CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Inglés I', 1, 1, 200, 0),
  ('Algoritmos y Estructuras I', 1, 1, 200, 0),
  ('Lengua y Comunicación', 1, 1, 200, 0),
  ('Introducción a la Informática', 1, 1, 200, 0),
  ('Matemática Discreta', 1, 1, 200, 0),
  ('Taller de Informática', 1, 1, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 1º AÑO - SEGUNDO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Inglés II', 2, 1, 200, 0),
  ('Programación Estructurada', 2, 1, 200, 0),
  ('Principios de Administración y Organización', 2, 1, 200, 0),
  ('Química General', 2, 1, 200, 0),
  ('Sistemas de Representación', 2, 1, 200, 0),
  ('Álgebra y Geometría Analítica', 2, 1, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2º AÑO - TERCER CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Análisis Matemático I', 1, 2, 200, 0),
  ('Algoritmos y Estructuras II', 1, 2, 200, 0),
  ('Sistemas Digitales', 1, 2, 200, 0),
  ('Física I', 1, 2, 200, 0),
  ('Elementos de Costos y Contabilidad', 1, 2, 200, 0),
  ('Sistemas de Información', 1, 2, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2º AÑO - CUARTO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Estadística', 2, 2, 200, 0),
  ('Análisis Matemático II', 2, 2, 200, 0),
  ('Bases de Datos', 2, 2, 200, 0),
  ('Física II', 2, 2, 200, 0),
  ('Arquitectura de Computadoras', 2, 2, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3º AÑO - QUINTO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Inglés Tecnológico', 1, 3, 200, 0),
  ('Programación Avanzada I', 1, 3, 200, 0),
  ('Sistemas Operativos I', 1, 3, 200, 0),
  ('Análisis Matemático III', 1, 3, 200, 0),
  ('Análisis de Sistemas', 1, 3, 200, 0),
  ('Análisis y Diseño de Algoritmos', 1, 3, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3º AÑO - SEXTO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Programación Avanzada II', 2, 3, 200, 0),
  ('Física III', 2, 3, 200, 0),
  ('Sistemas Operativos II', 2, 3, 200, 0),
  ('Diseño de Sistemas', 2, 3, 200, 0),
  ('Comunicación de Datos', 2, 3, 200, 0),
  ('Paradigmas y Lenguajes de Programación', 2, 3, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4º AÑO - SÉPTIMO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Autómatas y Lenguajes Formales', 1, 4, 200, 0),
  ('Redes de Computadoras I', 1, 4, 200, 0),
  ('Metodologías Avanzadas', 1, 4, 200, 0),
  ('Tecnologías de Bases de Datos', 1, 4, 200, 0),
  ('Investigación Operativa', 1, 4, 200, 0),
  ('Principios de Economía', 1, 4, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4º AÑO - OCTAVO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Compiladores', 2, 4, 200, 0),
  ('Redes de Computadoras II', 2, 4, 200, 0),
  ('Taller de Redes', 2, 4, 200, 0),
  ('Modelos y Simulación', 2, 4, 200, 0),
  ('Cálculo Numérico', 2, 4, 200, 0),
  ('Ingeniería del Software', 2, 4, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5º AÑO - NOVENO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Gestión de la Calidad y Auditoría', 1, 5, 200, 0),
  ('Inteligencia Artificial I', 1, 5, 200, 0),
  ('Investigación Científica', 1, 5, 200, 0),
  ('Teoría de Control', 1, 5, 200, 0),
  ('Legislación', 1, 5, 200, 0),
  ('Estudios y Proyectos', 1, 5, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5º AÑO - DÉCIMO CUATRIMESTRE
-- ============================================================================
INSERT INTO subjects (name, semester, year, capacity, current_enrollment) VALUES
  ('Taller de Formación y Prospectiva Profesional', 2, 5, 200, 0),
  ('Inteligencia Artificial II', 2, 5, 200, 0),
  ('Seguridad Laboral y Protección Ambiental', 2, 5, 200, 0),
  ('Proyectos Informáticos', 2, 5, 200, 0),
  ('Dirección y Gerenciamiento', 2, 5, 200, 0),
  ('Taller de Trabajo Final', 2, 5, 200, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CORRELATIVIDADES (PREREQUISITES)
-- ============================================================================

-- Función auxiliar para crear correlatividades
DO $$
DECLARE
  v_subject_id uuid;
  v_prereq_id uuid;
BEGIN
  -- 1º AÑO - SEGUNDO CUATRIMESTRE
  
  -- Inglés II requiere Inglés I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Inglés II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Inglés I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Programación Estructurada requiere Algoritmos y Estructuras I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Programación Estructurada' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Algoritmos y Estructuras I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Álgebra y Geometría Analítica requiere Matemática Discreta
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Álgebra y Geometría Analítica' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Matemática Discreta' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 2º AÑO - TERCER CUATRIMESTRE
  
  -- Análisis Matemático I requiere Álgebra y Geometría Analítica
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Análisis Matemático I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Álgebra y Geometría Analítica' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Algoritmos y Estructuras II requiere Programación Estructurada
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Algoritmos y Estructuras II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Programación Estructurada' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Física I requiere Álgebra y Geometría Analítica
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Física I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Álgebra y Geometría Analítica' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Sistemas de Información requiere Introducción a la Informática
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Sistemas de Información' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Introducción a la Informática' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 2º AÑO - CUARTO CUATRIMESTRE
  
  -- Estadística requiere Análisis Matemático I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Estadística' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Análisis Matemático II requiere Análisis Matemático I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Análisis Matemático II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Bases de Datos requiere Algoritmos y Estructuras II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Bases de Datos' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Algoritmos y Estructuras II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Física II requiere Física I y Análisis Matemático I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Física II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Física I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Física II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Arquitectura de Computadoras requiere Sistemas Digitales
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Arquitectura de Computadoras' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Sistemas Digitales' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 3º AÑO - QUINTO CUATRIMESTRE
  
  -- Inglés Tecnológico requiere Inglés II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Inglés Tecnológico' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Inglés II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Programación Avanzada I requiere Algoritmos y Estructuras II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Programación Avanzada I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Algoritmos y Estructuras II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Sistemas Operativos I requiere Arquitectura de Computadoras
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Sistemas Operativos I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Arquitectura de Computadoras' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Análisis Matemático III requiere Análisis Matemático II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Análisis Matemático III' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Análisis de Sistemas requiere Sistemas de Información
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Análisis de Sistemas' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Sistemas de Información' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Análisis y Diseño de Algoritmos requiere Algoritmos y Estructuras II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Análisis y Diseño de Algoritmos' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Algoritmos y Estructuras II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 3º AÑO - SEXTO CUATRIMESTRE
  
  -- Programación Avanzada II requiere Programación Avanzada I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Programación Avanzada II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Programación Avanzada I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Física III requiere Física II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Física III' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Física II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Sistemas Operativos II requiere Sistemas Operativos I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Sistemas Operativos II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Sistemas Operativos I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Diseño de Sistemas requiere Análisis de Sistemas y Bases de Datos
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Diseño de Sistemas' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis de Sistemas' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Diseño de Sistemas' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Bases de Datos' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Comunicación de Datos requiere Física II
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Comunicación de Datos' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Física II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Paradigmas y Lenguajes de Programación requiere Programación Avanzada I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Paradigmas y Lenguajes de Programación' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Programación Avanzada I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 4º AÑO - SÉPTIMO CUATRIMESTRE
  
  -- Autómatas y Lenguajes Formales requiere Matemática Discreta
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Autómatas y Lenguajes Formales' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Matemática Discreta' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Redes de Computadoras I requiere Comunicación de Datos
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Redes de Computadoras I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Comunicación de Datos' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Metodologías Avanzadas requiere Diseño de Sistemas
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Metodologías Avanzadas' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Diseño de Sistemas' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Tecnologías de Bases de Datos requiere Bases de Datos
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Tecnologías de Bases de Datos' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Bases de Datos' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Investigación Operativa requiere Estadística
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Investigación Operativa' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Estadística' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 4º AÑO - OCTAVO CUATRIMESTRE
  
  -- Compiladores requiere Autómatas y Lenguajes Formales
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Compiladores' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Autómatas y Lenguajes Formales' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Redes de Computadoras II requiere Redes de Computadoras I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Redes de Computadoras II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Redes de Computadoras I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Taller de Redes requiere Redes de Computadoras I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Taller de Redes' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Redes de Computadoras I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Modelos y Simulación requiere Estadística
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Modelos y Simulación' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Estadística' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Cálculo Numérico requiere Análisis Matemático III
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Cálculo Numérico' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático III' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Ingeniería del Software requiere Metodologías Avanzadas
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Ingeniería del Software' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Metodologías Avanzadas' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 5º AÑO - NOVENO CUATRIMESTRE
  
  -- Gestión de la Calidad y Auditoría requiere Ingeniería del Software
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Gestión de la Calidad y Auditoría' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Ingeniería del Software' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Inteligencia Artificial I requiere Programación Avanzada II y Análisis y Diseño de Algoritmos
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Inteligencia Artificial I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Programación Avanzada II' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Inteligencia Artificial I' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis y Diseño de Algoritmos' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Teoría de Control requiere Análisis Matemático III
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Teoría de Control' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Análisis Matemático III' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- 5º AÑO - DÉCIMO CUATRIMESTRE
  
  -- Inteligencia Artificial II requiere Inteligencia Artificial I
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Inteligencia Artificial II' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Inteligencia Artificial I' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Proyectos Informáticos requiere Ingeniería del Software
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Proyectos Informáticos' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Ingeniería del Software' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Dirección y Gerenciamiento requiere Principios de Economía
  SELECT id INTO v_subject_id FROM subjects WHERE name = 'Dirección y Gerenciamiento' LIMIT 1;
  SELECT id INTO v_prereq_id FROM subjects WHERE name = 'Principios de Economía' LIMIT 1;
  IF v_subject_id IS NOT NULL AND v_prereq_id IS NOT NULL THEN
    INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) 
    VALUES (v_subject_id, v_prereq_id) ON CONFLICT DO NOTHING;
  END IF;
  
END $$;

-- ============================================================================
-- RESUMEN
-- ============================================================================
SELECT 
  'Total de materias cargadas' as descripcion,
  COUNT(*) as cantidad
FROM subjects
UNION ALL
SELECT 
  'Total de correlatividades' as descripcion,
  COUNT(*) as cantidad
FROM subject_prerequisites;
