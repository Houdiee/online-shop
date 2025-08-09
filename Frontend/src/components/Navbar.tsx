import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import axios from "axios";
import { API_BASE_URL } from "../main";
import { Header } from "antd/es/layout/layout";
import { AutoComplete, Input, Menu } from "antd";

export default function Navbar() {
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${API_BASE_URL}/products`);
      const data: Product[] = await response.data;

      setProducts(data);
      setOptions(data.map((product) => ({ value: product.name })));
    };

    fetchProducts();
  }, []);

  const handleSearch = (value: string) => {
    if (!value) {
      setOptions(products.map((product) => ({ value: product.name })));
    } else {
      const filteredOptions = products
        .filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase())
        )
        .map((product) => ({ value: product.name }));
      setOptions(filteredOptions);
    }
  };

  return (
    <Header className="!bg-white flex items-center justify-between px-4">
      <Menu
        mode="horizontal"
        className="flex-1 min-w-0 border-b-0 !p-0 !h-auto"
      >
        <Menu.Item key="1">Home</Menu.Item>
        <Menu.Item key="2">Latest</Menu.Item>
      </Menu>

      <div className="flex-none w-1/2 flex justify-center">
        <AutoComplete
          className="w-full"
          options={options}
          onSearch={handleSearch}
          placeholder="Search"
        >
          <Input.Search />
        </AutoComplete>
      </div>

      <Menu
        mode="horizontal"
        className="flex-1 min-w-0 border-b-0 !p-0 !h-auto justify-end"
      >
        <Menu.Item key="3">Login / Signup</Menu.Item>
      </Menu>
    </Header>
  );
}
