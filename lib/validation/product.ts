import { z } from "zod";

export const productSizeSchema = z.object({
  size: z.string().trim().min(1).max(20),
  stock: z.coerce.number().int().min(0),
});

export const productImageSchema = z.object({
  url: z.string().trim().url(),
  alt: z.string().trim().max(200).optional(),
  isPrimary: z.boolean().optional(),
});

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(4000).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  category: z.string().trim().min(2).max(60),
  brand: z.string().trim().max(80).optional(),
  colour: z.string().trim().max(80).optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sizes: z.array(productSizeSchema).max(30),
  images: z.array(productImageSchema).max(10),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
