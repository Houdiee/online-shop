import { Col, Flex, Menu, Row, type MenuProps } from "antd";
import ProductCard from "../components/products/ProductCard";
import { product } from "../mock/product";
import type { Product } from "../types/product";

type MenuItem = Required<MenuProps>['items'][number];

export default function Products() {
  const products: Product[] = Array.from({ length: 50 }).map((_, index) => ({
    ...product,
    id: product.id + index,
  }));

  const filterItems: MenuItem[] = [
    {
      key: 0,
      label: "hello"
    }
  ];

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8} md={6} lg={5} xl={4}>
          <Menu
            mode="vertical"
            items={filterItems}
          />
        </Col>

        <Col xs={24} sm={16} md={18} lg={19} xl={20}>
          <Flex wrap gap={14} justify="center">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Flex>
        </Col>
      </Row>
    </>
  )
}
