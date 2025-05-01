/*
  # Add preparation tasks to hikes

  1. New Tables
    - `hike_tasks`
      - `id` (uuid, primary key)
      - `hike_id` (uuid, foreign key to hikes)
      - `description` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hike_tasks` table
    - Add policy for authenticated users to manage their own tasks
*/

CREATE TABLE IF NOT EXISTS hike_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id uuid REFERENCES hikes(id) ON DELETE CASCADE,
  description text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hike_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hike tasks"
  ON hike_tasks
  FOR ALL
  TO authenticated
  USING (
    hike_id IN (
      SELECT id FROM hikes WHERE user_id = auth.uid()
    )
  );