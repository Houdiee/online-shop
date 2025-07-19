import { Link } from "react-router-dom";
import { Card, Flex, Image, Typography } from "antd";

export default function ProductCard() {
  const productName = "straps";

  return (
    <>
      <Card variant="borderless" hoverable className="w-70">
        <Flex vertical gap={10}>
          <Link to={productName}>
            <Image preview={false} src="/straps.png" />
          </Link>
          <Flex vertical>
            <Typography.Text className="!text-md">Product Title</Typography.Text>
            <Typography.Text type="secondary">Variant</Typography.Text>
            <Typography.Text strong className="!text-md">$AUD</Typography.Text>
          </Flex>
        </Flex>
      </Card>
    </>
  );
}
