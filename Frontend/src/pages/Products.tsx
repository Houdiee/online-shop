import { Col, Flex, Row } from "antd";
import ProductCard from "../components/products/ProductCard";
import { type Product, type ProductVariant } from "../types/product";
import FilterMenu from "../components/products/FilterMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../main";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${API_BASE_URL}/products`);
      // const fetchedProducts: Product[] = response.data;

      // TODO remove this later
      const testProducts = Array.from({ length: 25 }, (_, index) => {
        const productTemplate = response.data[0];
        const uniqueProduct = { ...productTemplate };
        uniqueProduct.id = index + 1;
        uniqueProduct.variants = uniqueProduct.variants.map((variant: ProductVariant, variantIndex: number) => ({
          ...variant,
          id: (index * 10) + variantIndex + 1
        }));

        return uniqueProduct;
      });


      // setProducts(fetchedProducts);
      setProducts(testProducts); // TODO remove
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Row gutter={[50, 50]}>
        <Col xs={24} md={8} lg={7} xl={6}>
          <FilterMenu className="bg-white rounded-lg font-inter h-full" />
        </Col>

        <Col xs={24} md={16} lg={17} xl={18}>
          <Flex wrap gap={14}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Flex>
        </Col>
      </Row>
    </>
  )
}
