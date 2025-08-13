import { CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Image, Typography } from "antd";
import { useEffect, useState } from "react";
import type { ShoppingCart } from "../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL, user } from "../main";
import type { User } from "../types/user";
import QuantitySelector from "./product-details/QuantitySelector";

interface CartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingCartData?: ShoppingCart;
}

export default function CartMenu({ isOpen, onClose, shoppingCartData }: CartMenuProps) {
  const [cart, setCart] = useState<ShoppingCart | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${user.id}`);
        const userData: User = response.data;
        const cartData: ShoppingCart = userData.shoppingCart;
        setCart(cartData);
      } catch (error) {
        console.error("Failed to fetch shopping cart:", error);
      }
    };

    if (!shoppingCartData) {
      fetchCart();
    } else {
      setCart(shoppingCartData);
    }
  }, [shoppingCartData]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (cart) {
      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCart({ ...cart, items: updatedItems });
    }
  };

  const totalCost = cart?.items.reduce((total, item) => {
    return total + item.productVariant.price * item.quantity;
  }, 0);

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
        {!cart ? (
          <div className="text-gray-500 text-center flex-grow flex items-center justify-center">Loading cart...</div>
        ) : cart.items.length === 0 ? (
          <div className="text-gray-500 text-center flex-grow flex items-center justify-center">Your cart is currently empty.</div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2">
            <Flex vertical gap="middle">
              {cart.items.map(item => (
                <>
                  <Divider />
                  <Flex key={item.id} gap="middle" align="start">
                    <Image
                      src={`${API_BASE_URL}/${item.productVariant.photoUrls[0]}`}
                      width={80}
                      className="rounded-lg"
                      preview={false}
                    />
                    <Flex vertical justify="center" className="flex-grow">
                      <Typography.Text strong>{item.productVariant.parentProductName}</Typography.Text>
                      <Typography.Text type="secondary">{item.productVariant.name}</Typography.Text>
                      <Flex justify="space-between" align="center" className="mt-2">
                        <Typography.Text>${item.productVariant.price}</Typography.Text>
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(newQuantity) => handleQuantityChange(item.id, newQuantity)}
                          itemId={item.id}
                          isInCart
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </>
              ))}
            </Flex>
          </div>
        )}

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="mt-6 pt-4">
            <Divider className="!my-0" />
            <Flex justify="space-between" align="center" className="my-4">
              <Typography.Title level={4} className="!mb-0">Total:</Typography.Title>
              <Typography.Title level={4}>${totalCost?.toFixed(2)}</Typography.Title>
            </Flex>
            <Button type="primary" size="large" block>
              Go to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

