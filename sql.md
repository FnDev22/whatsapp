-- Add is_deleted column to products table
ALTER TABLE products ADD COLUMN is_deleted boolean DEFAULT false;

-- Create index for performance
CREATE INDEX idx_products_is_deleted ON products(is_deleted);

