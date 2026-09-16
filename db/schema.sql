CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  sex TEXT,
  age INTEGER CHECK (age BETWEEN 13 AND 120),
  height_cm NUMERIC(5,2) CHECK (height_cm BETWEEN 80 AND 260),
  weight_kg NUMERIC(6,2) CHECK (weight_kg BETWEEN 25 AND 400),
  level TEXT,
  goal TEXT,
  training_place TEXT,
  program_period TEXT,
  days_per_week INTEGER CHECK (days_per_week BETWEEN 1 AND 7),
  workout_minutes INTEGER CHECK (workout_minutes BETWEEN 5 AND 300),
  equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workout_progress_user_date_idx
  ON workout_progress (user_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS saved_workouts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_workouts_user_idx ON saved_workouts (user_id);

CREATE TABLE IF NOT EXISTS body_measurements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  weight_kg NUMERIC(6,2),
  waist_cm NUMERIC(6,2),
  hips_cm NUMERIC(6,2),
  chest_cm NUMERIC(6,2),
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS body_measurements_user_date_idx
  ON body_measurements (user_id, measured_at DESC);

