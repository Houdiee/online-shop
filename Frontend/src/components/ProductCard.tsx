import { Card, Flex, Image, Typography } from "antd";

export default function ProductCard() {
  return (
    <>
      <Card variant="borderless" hoverable className="w-70">
        <Flex vertical gap={10}>
          <Image src="/straps.png" />
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
