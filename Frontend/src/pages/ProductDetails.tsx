import { Carousel, ConfigProvider, Flex, Image } from "antd";

export default function ProductDetails() {
  const images = [
    "/straps.png",
    "/straps_1.png",
    "/straps_2.png",
  ];

  return (
    <>
      <Flex justify="center" align="center">
        <ConfigProvider theme={{ components: { Carousel: { arrowSize: 40 } } }}>
          <Carousel
            arrows={true}
            dots={true}
            infinite={true}
            autoplay={true}
            className="w-100"
          >
            {images.map((src, index) => (
              <div key={index}>
                <Image preview={false} src={src} />
              </div>
            ))}
          </Carousel >
        </ConfigProvider>
      </Flex >
    </>
  );
}
