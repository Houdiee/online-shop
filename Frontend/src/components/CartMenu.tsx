import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Image, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import type { ShoppingCart } from "../types/shopping-cart";
import axios from "axios";
import { API_BASE_URL, user } from "../main";
import type { User } from "../types/user";

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
            fixed top-0 right-0 h-full w-100 bg-white shadow-lg
            p-6 z-50 overflow-y-auto transition-transform duration-300
            ease-in-out transform
            ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <Space direction="vertical" className="w-full" size="large">
          <Flex justify="space-between" align="center" className="mb-6">
            <Typography.Title level={4} className="!mb-0">Your Cart</Typography.Title>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="!text-xl"
            />
          </Flex>

          {!cart ? (
            <div className="text-gray-500">Loading cart...</div>
          ) : cart.items.length === 0 ? (
            <div className="text-gray-500">Your cart is currently empty.</div>
          ) : (
            <Flex vertical>
              {cart.items.map(item => (
                <Space key={item.id} size="large">
                  <Image
                    src={`${API_BASE_URL}/${item.productVariant.photoUrls[0]}`}
                    width={80}
                    className="rounded-lg mr-4"
                    preview={false}
                  />
                  <Flex vertical justify="center">
                    <Flex>
                      <Typography.Text strong>{item.productVariant.parentProductName}</Typography.Text>
                      <Typography.Text> - {item.productVariant.name}</Typography.Text>
                    </Flex>
                    <Typography.Text type="secondary">${item.productVariant.price}</Typography.Text>
                    <Typography.Text>Quantity: {item.quantity}</Typography.Text>
                  </Flex>
                </Space>
              ))}
            </Flex>
          )}

        </Space>

      </div>
    </>
  );
}
