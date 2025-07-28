import { Flex } from "antd";
import ProductCard from "../components/ProductCard";
import { product } from "../mock/product";
import type { Product } from "../types/product";

export default function Products() {
  const products: Product[] = Array.from({ length: 50 }).map((_, index) => ({
    ...product,
    id: product.id + index,
  }));

  return (
    <>
      <Flex wrap gap={14}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Flex>
    </>
  )
}
