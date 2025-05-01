/*
  # Add function to increment category usage count

  1. New Functions
    - `increment_category_usage_count`: Safely increments the usage_count for a category
      - Takes category_id as parameter
      - Checks user ownership before incrementing
      - Returns the updated category

  2. Security
    - Function can only be executed by authenticated users
    - Users can only increment count for their own categories
*/

CREATE OR REPLACE FUNCTION increment_category_usage_count(category_id uuid)
RETURNS SETOF categories AS $$
BEGIN
  RETURN QUERY
    UPDATE categories
    SET usage_count = usage_count + 1
    WHERE id = category_id
    AND user_id = auth.uid()
    RETURNING *;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_category_usage_count(uuid) TO authenticated;