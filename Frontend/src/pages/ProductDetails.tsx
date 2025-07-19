import { Button, Carousel, ConfigProvider, Flex, Image, Typography } from "antd";

export default function ProductDetails() {
  const images = [
    "/straps.png",
    "/straps_1.png",
    "/straps_2.png",
  ];

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
            <Typography.Title level={2} type="secondary" className="!m-0">Variant</Typography.Title>
            <Typography.Title level={2} className="!m-0">$AUD</Typography.Title>
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
