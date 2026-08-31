import Link from "next/link";
import { listAllProducts } from "@/lib/admin/getProducts";
import { setProductActive } from "@/lib/admin/productActions";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { isInStock } from "@/lib/catalogue/queries";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const allProducts = await listAllProducts();

  const products = allProducts.filter((p) => {
    if (status === "active" && !p.active) return false;
    if (status === "inactive" && p.active) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const haystack = `${p.name} ${p.brand ?? ""} ${p.category}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
          Add Product
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, brand or category…"
          className="input sm:max-w-xs"
        />
        <select name="status" defaultValue={status} className="input sm:max-w-xs">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-border bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-neutral-900 hover:underline">
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-neutral-700">{product.category}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatMoney(product.sale_price ?? product.price, siteConfig.currencySymbol)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {isInStock(product) ? product.product_sizes.reduce((s, p) => s + p.stock, 0) : "Sold out"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <form action={setProductActive.bind(null, product.id, !product.active)}>
                      <button type="submit" className="text-xs text-neutral-700 hover:text-neutral-900 hover:underline">
                        {product.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
