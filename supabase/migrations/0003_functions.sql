-- Atomically decrements stock for one size, but only if enough stock is
-- available. Returns true if the decrement happened. Called only from the
-- server (service role) when a payment is confirmed as paid -- this is the
-- single point where stock actually changes; adding to a cart never does.
create or replace function decrement_product_stock(p_size_id uuid, p_qty int)
returns boolean
language plpgsql
as $$
declare
  v_rows int;
begin
  update product_sizes
  set stock = stock - p_qty
  where id = p_size_id and stock >= p_qty;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;
