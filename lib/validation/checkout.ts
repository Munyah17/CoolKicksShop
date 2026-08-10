import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1).max(20),
  quantity: z.coerce.number().int().min(1).max(10),
});

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(2, "Please enter your full name.").max(120),
    phone: z.string().trim().min(6, "Please enter a valid phone number.").max(30),
    email: z.union([z.literal(""), z.string().trim().email()]).optional(),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    deliveryOptionId: z.string().uuid().optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(500).optional(),
    items: z.array(checkoutItemSchema).min(1, "Your cart is empty."),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery") {
      if (!data.deliveryOptionId) {
        ctx.addIssue({ code: "custom", message: "Please choose a delivery area.", path: ["deliveryOptionId"] });
      }
      if (!data.address) {
        ctx.addIssue({ code: "custom", message: "Please enter a delivery address.", path: ["address"] });
      }
      if (!data.city) {
        ctx.addIssue({ code: "custom", message: "Please enter your city/town.", path: ["city"] });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
