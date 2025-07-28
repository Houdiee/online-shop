import { Flex, Tag, Typography } from "antd";

type ProductInfoProps = {
  name: string;
  price: string;
  tags: string[];
};

export default function ProductInfo({ name, price, tags }: ProductInfoProps) {
  return (
    <Flex vertical gap={10}>
      <Typography.Title level={1} className="!m-0">{name}</Typography.Title>
      <Typography.Title level={2} className="!m-0">${price}</Typography.Title>
      <Flex>
        {tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </Flex>
    </Flex>
  );
}
