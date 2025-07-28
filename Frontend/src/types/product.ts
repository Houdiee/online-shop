export type Product = {
  id: number;
  name: string;
  description: string | null;
  tags: string[];
  variants: ProductVariant[];
  createdAt: Date;
};

export type ProductVariant = {
  id: number;
  name: string;
  imageUrls: string[];
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  createdAt: Date;
};
