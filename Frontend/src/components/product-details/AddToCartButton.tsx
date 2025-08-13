import { useState } from "react";
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type AddShoppingCartItemRequest } from "../../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL, user } from "../../main";

export default function AddToCartButton({ productVariantId, quantity }: AddShoppingCartItemRequest) {
  const [buttonState, setButtonState] = useState<"default" | "success">('default');

  const handleAddToCart = async () => {
    try {
      await axios.post(`${API_BASE_URL}/users/${user.id}/shoppingcart`, {
        ProductVariantId: productVariantId,
        Quantity: quantity,
      });

      console.log(user);

      setButtonState('success');

      setTimeout(() => {
        setButtonState('default');
      }, 3000);

    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  return (
    <>
      <Button
        size="large"
        type={buttonState === 'success' ? 'default' : 'primary'}
        className={`!mt-auto ${buttonState === 'success' ? '!bg-green-500 !text-white !border-green-500' : ''}`}
        onClick={handleAddToCart}
      >
        {buttonState === 'success' ? <CheckOutlined /> : <ShoppingCartOutlined />}
        {buttonState === 'success' ? ' Added to Cart' : ' Add to Cart'}
      </Button>
    </>
  );
}

