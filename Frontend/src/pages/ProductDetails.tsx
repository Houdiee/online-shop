import { Button, Carousel, ConfigProvider, Flex, Image, Typography } from "antd";
import { useState } from "react";

export default function ProductDetails() {
  const images = [
    "/straps.png",
    "/straps_1.png",
    "/straps_2.png",
  ];

  const variants = [
    { name: "Black", image: "/straps.png" },
    { name: "Blue", image: "/straps_1.png" },
    { name: "Red", image: "/straps_2.png" },
  ];

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

            <Flex gap={10} className="!mt-10">
              {variants.map((variant, index) => (
                <Flex vertical align="center">
                  <Image
                    key={index}
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
                    key={index}
                    type={selectedVariant.name === variant.name ? undefined : "secondary"}
                    className={`
                      ${selectedVariant.name === variant.name ? "text-blue-500 font-bold" : "font-normal"}
                    `}
                  >
                    {variant.name}
                  </Typography.Text>
                </Flex>
              ))}
            </Flex>
          </Flex>

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

          <Button size="large" type="primary" className="!mt-auto">
            Add to Cart
          </Button>
        </Flex>

      </Flex>
    </>
  );
}
