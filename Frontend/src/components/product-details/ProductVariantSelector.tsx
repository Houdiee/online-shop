import { Flex, Image, Typography } from "antd";

export type Variant = {
  id: number;
  name: string;
  image: string;
};

type ProductVariantSelectorProps = {
  variants: Variant[];
  selectedVariant: Variant;
  onSelectVariant: (variant: Variant) => void;
};

export default function ProductVariantSelector({ variants, selectedVariant, onSelectVariant }: ProductVariantSelectorProps) {
  return (
    <Flex gap={10} className="!mt-10">
      {variants.map((variant, index) => (
        <Flex vertical align="center" key={index} onClick={() => onSelectVariant(variant)}>
          <Image
            src={variant.image}
            preview={false}
            width={60}
            className={`
              cursor-pointer
              ${selectedVariant.name === variant.name ? "border-2 border-blue-500" : "border border-gray-300"}
            `}
          />
          <Typography.Text
            className={selectedVariant.name === variant.name ? "!text-blue-500 font-bold" : "font-normal"}
          >
            {variant.name}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
}