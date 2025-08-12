import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useEffect } from "react";
import type { ShoppingCart } from "../types/shopping-cart";

interface CartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingCartData?: ShoppingCart;
}

export default function CartMenu({ isOpen, onClose }: CartMenuProps) {
  useEffect(() => {
    // handle logic
  });

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
        <Flex justify="space-between" align="center" className="mb-6">
          <Typography.Title level={4} className="!mb-0">Your Cart</Typography.Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="!text-xl"
          />
        </Flex>
        {/* Placeholder content for the cart */}
        <div className="text-gray-500">Your cart is currently empty.</div>
        {/* You would populate this section with cart items */}
      </div>
    </>
  );
}
