export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  unitPrice: number;
  quantity: number;
  colour: string | null;
  imageUrl: string | null;
}
