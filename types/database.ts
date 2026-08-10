export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "ready_for_dispatch"
  | "delivered"
  | "cancelled";

export type DeliveryType = "delivery" | "pickup";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category: string;
  brand: string | null;
  colour: string | null;
  price: number;
  sale_price: number | null;
  currency: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductSizeRow {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  sku: string | null;
}

export interface DeliveryOptionRow {
  id: string;
  name: string;
  type: DeliveryType;
  fee: number;
  active: boolean;
  sort_order: number;
}

export interface OrderRow {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  delivery_notes: string | null;
  delivery_option_id: string | null;
  delivery_method: DeliveryType;
  delivery_fee: number;
  subtotal: number;
  total: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_size_id: string | null;
  product_name: string;
  size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  merchant_reference: string;
  paynow_reference: string | null;
  poll_url: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  raw_last_status: string | null;
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
}

export type ProductWithDetails = ProductRow & {
  product_images: ProductImageRow[];
  product_sizes: ProductSizeRow[];
};
