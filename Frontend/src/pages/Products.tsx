import { Flex } from "antd";
import ProductCard from "../components/products/ProductCard";
import { type Product } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../main";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${API_BASE_URL}/products`);
      const fetchedProducts: Product[] = response.data;
      setProducts(fetchedProducts);
    };

    fetchProducts();
  }, [products]);

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
