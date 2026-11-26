alter table products
  add column if not exists previous_amount numeric(12, 2);

comment on column products.previous_amount is
  'Optional struck-through price. Null means no discount. Must be higher than amount when set.';
