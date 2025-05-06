/*
  # Add new fields to gear_items table
  
  1. Changes
    - Add volume field for storing capacity information
    - Add sizes field for dimensions or available sizes
    - Add purpose field for use cases
    
  2. Notes
    - All fields are nullable to maintain compatibility
*/

ALTER TABLE gear_items
ADD COLUMN volume text,
ADD COLUMN sizes text,
ADD COLUMN purpose text;