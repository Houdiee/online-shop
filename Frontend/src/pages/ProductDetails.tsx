import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Carousel, ConfigProvider, Divider, Flex, Form, Image, InputNumber, Space, Tag, Typography } from "antd";
import { useState } from "react";

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
    <>
      <Flex gap={60} className="!mt-30 !ml-50 !mr-50">

        {/* Left side (aka image) */}
        <Flex flex={1} justify="center" align="center">
          <ConfigProvider theme={{ components: { Carousel: { arrowSize: 40 } } }}>
            <Carousel
              arrows={true}
              dots={true}
              infinite={true}
              autoplay={true}
              className="w-125"
            >
              {images.map((src, index) => (
                <div key={index}>
                  <Image preview={false} src={src} />
                </div>
              ))}
            </Carousel >
          </ConfigProvider>
        </Flex >

        {/* Right side (aka title, description, variant, etc.) */}
        <Flex vertical flex={1}>

          <Flex vertical gap={10}>
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
          </Flex>

          <Space direction="vertical" size="large">
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

            <Form>
              <Form.Item label="Quantity">
                <InputNumber
                  value={quantity}
                  min={1}
                  onChange={(value: number | null) => setQuantity(value || 1)}
                  className="text-center"
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

      </Flex>
    </>
  );
}
