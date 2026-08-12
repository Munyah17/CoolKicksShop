import Link from "next/link";
import { listAllProducts } from "@/lib/admin/getProducts";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { isInStock } from "@/lib/catalogue/queries";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-border bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
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
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
