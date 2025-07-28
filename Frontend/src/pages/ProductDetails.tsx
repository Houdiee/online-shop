import { Breadcrumb, Col, Divider, Flex, Row, Space } from "antd";
import { useState } from "react";
import ProductImageCarousel from "../components/product-details/ProductImageCarousel";
import AddToCartButton from "../components/product-details/AddToCartButton";
import ProductDescription from "../components/product-details/ProductDescription";
import ProductInfo from "../components/product-details/ProductInfo";
import ProductVariantSelector from "../components/product-details/ProductVariantSelector";
import QuantitySelector from "../components/product-details/QuantitySelector";
import type { Product, ProductVariant } from "../types/product";

export default function ProductDetails() {
  const product: Product = {
    id: 1,
    name: "Straps",
    description: null,
    tags: ["fitness", "health", "equipment"],
    variants: [
      { id: 1, name: "Black", imageUrls: ["/straps.png", "/straps_1.png"], price: 12.00, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
      { id: 2, name: "Blue", imageUrls: ["/straps_1.png"], price: 10.00, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
      { id: 3, name: "Red", imageUrls: ["/straps_2.png"], price: 11.50, discountedPrice: null, stockQuantity: 60, createdAt: new Date() },
    ],
    createdAt: new Date(),
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 xl:px-24">
      <div className="max-w-screen-xl mx-auto">
        <Row gutter={[24, 24]} justify="center" align="stretch">

          {/* Left side (aka image) */}
          <Col xs={24} md={24} lg={12} xl={12}>
            <Flex vertical className="h-full">
              <Breadcrumb items={[
                { title: "Products", path: "/products" },
                { title: "Name", path: "/products/straps" }, // TODO
                { title: selectedVariant.name },
              ]}
              />
              <ProductImageCarousel imageUrls={selectedVariant.imageUrls} />
            </Flex>
          </Col>

          {/* Right side (aka title, description, variant, etc.) */}
          <Col xs={24} md={24} lg={12} xl={12}>
            <Flex vertical gap={10} className="h-full">
              <ProductInfo name={product.name} price={selectedVariant.price} tags={product.tags} />

              <Divider className="!mb-0" />

              <Space direction="vertical" size="large" className="w-full">
                <ProductVariantSelector variants={product.variants} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant} />
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </Space>

              <Flex>
                <ProductDescription description={product.description} />
              </Flex>

              <AddToCartButton productVariantId={selectedVariant.id} quantity={quantity} />
            </Flex>
          </Col>
        </Row >
      </div>
    </div>
  );
}
