import { useContext, useState } from "react";
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type AddShoppingCartItemRequest, type ShoppingCart } from "../../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL } from "../../main";
import { UserContext } from "../../contexts/UserContext";

export default function AddToCartButton({ productVariantId, quantity }: AddShoppingCartItemRequest) {
  const { user, setUser, token } = useContext(UserContext);
  const [buttonState, setButtonState] = useState<"default" | "success">('default');

  const handleAddToCart = async () => {
    if (user) {
      console.log("AddToCartButton: handleAddToCart - User before API call:", user);
      try {
        const response = await axios.post(`${API_BASE_URL}/users/${user.id}/shoppingcart`, {
          ProductVariantId: productVariantId,
          Quantity: quantity,
        });

        console.log("AddToCartButton: handleAddToCart - API response data:", response.data);

        const userFromResponse = response.data;
        const finalUser = {
          ...userFromResponse,
          role: user?.role
        };

        console.log("AddToCartButton: handleAddToCart - Final user object before setUser:", finalUser);
        console.log("AddToCartButton: handleAddToCart - Token passed to setUser:", user.token);

        setUser(finalUser, token);

        setButtonState('success');

        setTimeout(() => {
          setButtonState('default');
        }, 3000);

      } catch (error) {
        console.error("AddToCartButton: Failed to add item to cart:", error);
      }
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

