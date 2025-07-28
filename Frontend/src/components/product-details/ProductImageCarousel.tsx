import { Carousel, ConfigProvider, Image } from "antd";

interface ProductImageCarouselProps {
  imageUrls: string[];
}

export default function ProductImageCarousel({ imageUrls }: ProductImageCarouselProps) {
  return (
    <>
      <ConfigProvider
        theme={{ components: { Carousel: { arrowSize: 40 } } }}
      >
        <Carousel
          arrows={true}
          dots={true}
          infinite={true}
          autoplay={true}
          className="w-full h-full"
        >
          {imageUrls.map((src: string, index: number) => (
            <div key={index} className="h-full flex items-center justify-center">
              <Image
                preview={false}
                src={src}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </Carousel >
      </ConfigProvider>

    </>
  );
}
