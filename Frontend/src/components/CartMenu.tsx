import { CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Image, Space, Typography } from "antd";
import { useContext, useState } from "react";
import type { ShoppingCart } from "../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL } from "../main";
import QuantitySelector from "./product-details/QuantitySelector";
import { UserContext } from "../contexts/UserContext";

interface CartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartMenu({ isOpen, onClose }: CartMenuProps) {
  const { user, setUser, token } = useContext(UserContext);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (user && user.shoppingCart) {
      try {
        const response = await axios.patch(`${API_BASE_URL}/users/${user.id}/shoppingcart/${itemId}`, {
          quantity: newQuantity,
        });

        const userFromResponse = response.data;
        const finalUser = {
          ...userFromResponse,
          role: user?.role
        };
        setUser(finalUser, token);
      } catch (error) {
        console.error("CartMenu: Failed to update item quantity:", error);
      }
    }
  };

  const totalCost = user?.shoppingCart?.items.reduce((total, item) => {
    if (item.productVariant) {
      return total + item.productVariant.price * item.quantity;
    }
    return total;
  }, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    if (!user?.shoppingCart) {
      console.error("Cannot checkout with empty cart");
      return;
    }

    const response = await axios.post(`${API_BASE_URL}/payment/checkout/${user.shoppingCart.id}`);
    const redirectURL = response.data.url;
    window.location.href = redirectURL;
    setIsCheckingOut(false);
  };


  return (
    <>
      {/* Cart Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Main sidebar content */}
      <div
        className={`
          fixed top-0 right-0 h-full max-w-sm w-full bg-white shadow-lg
          p-6 z-50 transition-transform duration-300
          ease-in-out transform flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" className="mb-6">
          <Typography.Title level={4} className="!mb-0">Your Cart</Typography.Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="!text-xl"
          />
        </Flex>

        {/* Cart items content */}
        {!user?.shoppingCart ? (
          <div className="text-gray-500 text-center flex-grow flex items-center justify-center">Loading cart...</div>
        ) : user.shoppingCart.items.length === 0 ? (
          <div className="text-gray-500 text-center flex-grow flex items-center justify-center">Your cart is currently empty.</div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2">
            <Flex vertical gap="middle">
              {user.shoppingCart.items.map(item => (
                item.productVariant && (
                  <div key={item.id}>
                    <Divider size="small" />
                    <Flex gap="middle" align="center" className="my-4">
                      <Image
                        src={`${API_BASE_URL}/${item.productVariant.photoUrls[0]}`}
                        width={100}
                        className="rounded-lg shadow-sm"
                        preview={false}
                      />

                      <Space direction="vertical" size="middle" className="flex-grow justify-center">
                        <Typography.Text strong className="text-base">{item.productVariant.parentProductName}</Typography.Text>
                        <Typography.Text type="secondary" className="text-sm">{item.productVariant.name}</Typography.Text>

                        <Flex justify="space-between">
                          <QuantitySelector
                            quantity={item.quantity}
                            onQuantityChange={(newQuantity) => handleQuantityChange(item.id, newQuantity)}
                            itemId={item.id}
                            isInCart
                            hideLabel
                          />
                          <Typography.Title level={5}>${((item.productVariant?.price || 0) * item.quantity).toFixed(2)}</Typography.Title>
                        </Flex>
                      </Space>
                    </Flex>
                  </div>
                )
              ))}
            </Flex>
          </div>
        )}

        {/* Footer */}
        {user?.shoppingCart && user.shoppingCart.items.length > 0 && (
          <div className="mt-6 pt-4">
            <Divider className="!my-0" />
            <Flex justify="space-between" align="center" className="my-4">
              <Typography.Title level={4} className="!mb-0">Total:</Typography.Title>
              <Typography.Title level={4}>${totalCost?.toFixed(2)}</Typography.Title>
            </Flex>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Checking out..." : "Go to Checkout"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

