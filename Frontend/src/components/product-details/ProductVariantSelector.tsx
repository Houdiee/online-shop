import { Flex, Image, Typography } from "antd";
import { type ProductVariant } from "../../types/product";

type ProductVariantSelectorProps = {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
};

export default function ProductVariantSelector({ variants, selectedVariant, onSelectVariant }: ProductVariantSelectorProps) {
  return (
    <Flex gap={10} className="!mt-10">
      {variants.map((variant, index) => (
        <Flex vertical align="center" key={variant.id} onClick={() => onSelectVariant(variant)}>
          <Image
            src={variant.photoUrls[0]}
            preview={false}
            width={60}
            className={`
              cursor-pointer
              ${selectedVariant.id === variant.id ? "border-2 border-blue-500" : "border border-gray-300"}
            `}
          />
          <Typography.Text
            className={selectedVariant.id === variant.id ? "!text-blue-500 font-bold" : "font-normal"}
          >
            {variant.name}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
}
