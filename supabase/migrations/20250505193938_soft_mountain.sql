/*
  # Add detailed gear specifications
  
  1. Changes
    - Add volume field for capacity measurements
    - Add sizes field for dimensions/measurements
    - Add purpose field for detailed use cases
    
  2. Notes
    - All new fields are nullable for backward compatibility
*/

ALTER TABLE gear_items
ADD COLUMN volume text,
ADD COLUMN sizes text,
ADD COLUMN purpose text;