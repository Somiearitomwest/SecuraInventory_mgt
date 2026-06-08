alter table products
  add column if not exists stock_quantity numeric default 0,
  add column if not exists low_stock_threshold numeric default 0,
  add column if not exists supplier_email text;

update products
set
  stock_quantity = coalesce(stock_quantity, 0),
  low_stock_threshold = coalesce(low_stock_threshold, 0);
