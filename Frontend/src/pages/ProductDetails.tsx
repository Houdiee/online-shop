import { ShoppingCartOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Carousel, Col, ConfigProvider, Divider, Flex, Form, Image, InputNumber, Row, Space, Tag, Typography } from "antd";
import { useState } from "react";
import ProductImageCarousel from "../components/ProductImageCarousel";

export type AddShoppingCartItemRequest = {
  productVariantId: number;
  quantity: number;
}

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

  const variants = [
    { name: "Black", image: "/straps.png" },
    { name: "Blue", image: "/straps_1.png" },
    { name: "Red", image: "/straps_2.png" },
  ];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 xl:px-24">
      <div className="max-w-screen-xl mx-auto">
        <Row gutter={[24, 24]} justify="center" align="stretch">

          {/* Left side (aka image) */}
          {/* Changed md to 24 to stack on medium screens and below */}
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
          {/* Changed md to 24 to stack on medium screens and below */}
          <Col xs={24} md={24} lg={12} xl={12}>
            <Flex vertical gap={10} className="h-full">
              <Typography.Title level={1} className="!m-0">Product Title</Typography.Title>
              <Typography.Title level={2} className="!m-0">$AUD</Typography.Title>

              <Flex>
                {tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                  </Tag>
                ))}
              </Flex>

              <Divider className="!mb-0" />

              <Space direction="vertical" size="large" className="w-full">
                <Flex gap={10} className="!mt-10">
                  {variants.map((variant, index) => (
                    <Flex vertical align="center" key={index}>
                      <Image
                        src={variant.image}
                        preview={false}
                        width={60}
                        className={`
                          cursor-pointer
                          ${selectedVariant.name === variant.name ? "border-2 border-blue-500" : "border border-gray-300"}
                        `}
                        onClick={() => setSelectedVariant(variant)}
                      />
                      <Typography.Text
                        className={selectedVariant.name === variant.name ? "!text-blue-500 font-bold" : "font-normal"}
                      >
                        {variant.name}
                      </Typography.Text>
                    </Flex>
                  ))}
                </Flex>

                <Form layout="vertical">
                  <Form.Item label="Quantity">
                    <InputNumber
                      value={quantity}
                      min={1}
                      onChange={(value: number | null) => setQuantity(value || 1)}
                    />
                  </Form.Item>
                </Form>
              </Space>

              <Typography.Paragraph type="secondary" className="!mt-auto">
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
                Description is not available for this product.
              </Typography.Paragraph>

              <Button
                size="large"
                type="primary"
                className="!mt-auto"
              >
                <ShoppingCartOutlined /> Add to Cart
              </Button>
            </Flex>
          </Col>
        </Row >
      </div>
    </div>
  );
}
