import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type AddShoppingCartItemRequest } from "../../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL, user } from "../../main";

export default function AddToCartButton({ productVariantId, quantity }: AddShoppingCartItemRequest) {
  const handleAddToCart = async () => {
    await axios.post(`${API_BASE_URL}/users/${user.id}/shoppingcart`, {
      ProductVariantId: productVariantId,
      Quantity: quantity,
    });
    console.log(user);
  };

  return (
    <>
      <Button
        size="large"
        type="primary"
        className="!mt-auto"
        onClick={handleAddToCart}
      >
        <ShoppingCartOutlined /> Add to Cart
      </Button>
    </>
  );
}
