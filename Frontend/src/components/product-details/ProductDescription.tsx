import { Typography } from "antd";

type ProductDescriptionProps = {
  description: string | null;
};

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <Typography.Paragraph type="secondary" className="!mt-auto">
      {description ? description : "Description is not provided for this product"}
    </Typography.Paragraph>
  );
}
