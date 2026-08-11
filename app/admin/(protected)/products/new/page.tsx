import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Add Product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
