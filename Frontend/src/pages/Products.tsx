import { Flex } from "antd";
import ProductCard from "../components/products/ProductCard";
import { product } from "../mock/product";
import type { Product } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";

export default function Products() {
  const products: Product[] = Array.from({ length: 50 }).map((_, index) => ({
    ...product,
    id: product.id + index,
  }));

  return (
    <>
      <Flex justify="center" className="h-100">
        hello
      </Flex>

      <Flex>
        <FilterMenu />
        <Flex wrap gap={14} justify="center">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Flex>
      </Flex>
    </>
  )
}
