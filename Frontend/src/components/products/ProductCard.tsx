import { Link } from "react-router-dom";
import { Card, Flex, Image, Typography } from "antd";
import type { Product } from "../../types/product";
import { API_BASE_URL } from "../../main";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants[0];
  const defaultImage = `${API_BASE_URL}/${defaultVariant.photoUrls[0]}`;

  return (
    <Card
      variant="borderless"
      hoverable
      className="w-70"
    >
      <Flex vertical gap={10}>
        <Link to={product.id.toString()}>
          <Image preview={false} src={defaultImage} />
          <Flex vertical>
            <Typography.Text strong className="!text-md">{product.name}</Typography.Text>
            <Typography.Text type="secondary">{defaultVariant.name}</Typography.Text>
            <Typography.Text className="!text-md">${defaultVariant.price}</Typography.Text>
          </Flex>
        </Link>
      </Flex>
    </Card>
  );
}
