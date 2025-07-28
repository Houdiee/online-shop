import { Typography } from "antd";

type ProductDescriptionProps = {
  description: string;
};

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <Typography.Paragraph type="secondary" className="!mt-auto">
      {description}
    </Typography.Paragraph>
  );
}