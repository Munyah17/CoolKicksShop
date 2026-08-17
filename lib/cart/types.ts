export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  // Empty string means "not chosen yet" -- size is picked in the cart,
  // not at add-to-cart time. availableSizes lets the cart render a size
  // picker without re-fetching the product.
  size: string;
  availableSizes: { size: string; stock: number }[];
  unitPrice: number;
  quantity: number;
  colour: string | null;
  imageUrl: string | null;
}
