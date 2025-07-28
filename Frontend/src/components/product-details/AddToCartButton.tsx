import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type AddShoppingCartItemRequest } from "../../types/shopping-cart";

export default function AddToCartButton({ productVariantId, quantity }: AddShoppingCartItemRequest) {
  const handleAddToCart = () => {
    console.log({ productVariantId, quantity });
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
