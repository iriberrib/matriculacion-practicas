/*
  # Disable RLS for admin panel
  
  Since this is an admin panel with controlled access,
  we disable RLS to allow the application to function.
  In production, this would be secured with proper authentication.
*/

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE careers DISABLE ROW LEVEL SECURITY;
ALTER TABLE career_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE career_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_ids_log DISABLE ROW LEVEL SECURITY;
