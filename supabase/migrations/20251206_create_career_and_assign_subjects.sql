/*
  # Crear Carrera "Ingeniería en Sistemas" y Asignar Materias
  
  Este script:
  1. Crea la carrera "Ingeniería en Sistemas" (5 años, 10 cuatrimestres)
  2. Asigna todas las 60 materias a la carrera con su año y cuatrimestre
*/

-- ============================================================================
-- 1. CREAR CARRERA
-- ============================================================================

INSERT INTO careers (title, total_years, total_semesters)
VALUES (
  'Ingeniería en Sistemas',
  5,
  10
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. ASIGNAR TODAS LAS MATERIAS A LA CARRERA
-- ============================================================================

DO $$
DECLARE
  v_career_id uuid;
  v_subject record;
BEGIN
  -- Obtener el ID de la carrera recién creada
  SELECT id INTO v_career_id 
  FROM careers 
  WHERE title = 'Ingeniería en Sistemas' 
  LIMIT 1;

  IF v_career_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró la carrera Ingeniería en Sistemas';
  END IF;

  -- Asignar todas las materias a la carrera con su año y cuatrimestre
  FOR v_subject IN 
    SELECT id, name, year, semester FROM subjects ORDER BY year, semester, name
  LOOP
    INSERT INTO career_subjects (career_id, subject_id, year, semester)
    VALUES (v_career_id, v_subject.id, v_subject.year, v_subject.semester)
    ON CONFLICT (career_id, subject_id) DO NOTHING;
    
    RAISE NOTICE 'Asignada: % (Año %, Cuatrimestre %)', v_subject.name, v_subject.year, v_subject.semester;
  END LOOP;

  RAISE NOTICE 'Carrera creada con ID: %', v_career_id;
END $$;

-- ============================================================================
-- 3. VERIFICACIÓN
-- ============================================================================

-- Mostrar resumen
SELECT 
  c.title as carrera,
  c.total_years as años,
  c.total_semesters as cuatrimestres,
  COUNT(cs.subject_id) as materias_asignadas
FROM careers c
LEFT JOIN career_subjects cs ON c.id = cs.career_id
WHERE c.title = 'Ingeniería en Sistemas'
GROUP BY c.id, c.title, c.total_years, c.total_semesters;

-- Mostrar materias por año y cuatrimestre
SELECT 
  cs.year as año,
  cs.semester as cuatrimestre,
  COUNT(*) as cantidad_materias,
  STRING_AGG(s.name, ', ' ORDER BY s.name) as materias
FROM career_subjects cs
JOIN subjects s ON cs.subject_id = s.id
JOIN careers c ON cs.career_id = c.id
WHERE c.title = 'Ingeniería en Sistemas'
GROUP BY cs.year, cs.semester
ORDER BY cs.year, cs.semester;
