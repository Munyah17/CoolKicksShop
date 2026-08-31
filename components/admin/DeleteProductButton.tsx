"use client";

import { deleteProduct } from "@/lib/admin/productActions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={() => deleteProduct(id)}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${name}"? This permanently removes it from the catalogue.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-xs text-muted hover:text-red-600">
        Delete
      </button>
    </form>
  );
}
