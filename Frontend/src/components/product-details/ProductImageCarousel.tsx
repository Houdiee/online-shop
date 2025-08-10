import { Carousel, ConfigProvider, Image } from "antd";

interface ProductImageCarouselProps {
  photoUrls: string[];
}

export default function ProductImageCarousel({ photoUrls }: ProductImageCarouselProps) {
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
          {photoUrls.map((src: string, index: number) => (
            <div key={index} className="aspect-square overflow-hidden !flex !items-center">
              <Image
                preview={false}
                src={src}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </Carousel >
      </ConfigProvider>
    </>
  );
}
