import { Form, InputNumber } from "antd";
import axios from "axios";
import { API_BASE_URL } from "../../main";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  itemId?: number;
  isInCart?: boolean;
  hideLabel?: boolean;
  className?: string;
};

export default function QuantitySelector({ quantity, onQuantityChange, itemId, isInCart, hideLabel, className }: QuantitySelectorProps) {
  const { user } = useContext(UserContext);

  const handleQuantityChange = (value: number | null) => {
    const newQuantity = value || 1;
    onQuantityChange(newQuantity);

    if (isInCart && itemId && user) {
      axios.patch(`${API_BASE_URL}/users/${user.id}/shoppingcart/${itemId}`, {
        quantity: newQuantity,
      });
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label={hideLabel ? "" : "Quantity"}>
        <InputNumber
          value={quantity}
          min={1}
          onChange={handleQuantityChange}
          className={className}
        />
      </Form.Item>
    </Form>
  );
}
