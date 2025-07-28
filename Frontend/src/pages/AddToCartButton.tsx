import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button } from "antd";

export type AddShoppingCartItemRequest = {
  productVariantId: number;
  quantity: number;
}

export default function AddToCartButton() {
  return (
    <>
      <Button
        size="large"
        type="primary"
        className="!mt-auto"
      >
        <ShoppingCartOutlined /> Add to Cart
      </Button>

    </>
  );
}
