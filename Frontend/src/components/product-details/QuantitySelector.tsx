import { Form, InputNumber } from "antd";

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export default function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  return (
    <Form layout="vertical">
      <Form.Item label="Quantity">
        <InputNumber
          value={quantity}
          min={1}
          onChange={(value: number | null) => onQuantityChange(value || 1)}
        />
      </Form.Item>
    </Form>
  );
}