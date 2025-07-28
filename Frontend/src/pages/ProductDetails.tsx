import { Breadcrumb, Col, Divider, Flex, Row, Space } from "antd";
import { useState } from "react";
import ProductImageCarousel from "../components/product-details/ProductImageCarousel";
import AddToCartButton from "../components/product-details/AddToCartButton";
import ProductDescription from "../components/product-details/ProductDescription";
import ProductInfo from "../components/product-details/ProductInfo";
import ProductVariantSelector, { type Variant } from "../components/product-details/ProductVariantSelector";
import QuantitySelector from "../components/product-details/QuantitySelector";

export default function ProductDetails() {
  const images = [
    "/straps.png",
    "/straps_1.png",
    "/straps_2.png",
  ];

  const tags = [
    "fitness",
    "hardware",
    "equipment",
  ];

  const variants: Variant[] = [
    { id: 1, name: "Black", image: "/straps.png" },
    { id: 2, name: "Blue", image: "/straps_1.png" },
    { id: 3, name: "Red", image: "/straps_2.png" },
  ];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

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
              <ProductImageCarousel imageUrls={images} />
            </Flex>
          </Col>

          {/* Right side (aka title, description, variant, etc.) */}
          <Col xs={24} md={24} lg={12} xl={12}>
            <Flex vertical gap={10} className="h-full">
              <ProductInfo name="Product Title" price="$AUD" tags={tags} />

              <Divider className="!mb-0" />

              <Space direction="vertical" size="large" className="w-full">
                <ProductVariantSelector variants={variants} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant} />
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </Space>

              <ProductDescription description="Description is not available for this product." />

              <AddToCartButton productVariantId={selectedVariant.id} quantity={quantity} />
            </Flex>
          </Col>
        </Row >
      </div>
    </div>
  );
}
