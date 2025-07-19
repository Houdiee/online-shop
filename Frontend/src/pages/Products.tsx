import { Flex } from "antd";
import ProductCard from "../components/ProductCard";

export default function Products() {
  return (
    <>
      <Flex wrap gap={14}>
        {
          Array.from({ length: 50 }).map((_, index) => (
            <ProductCard key={index} />
          ))
        }
      </Flex>
    </>
  )
}
