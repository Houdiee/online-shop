import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import axios from "axios";
import { API_BASE_URL } from "../main";
import { Header } from "antd/es/layout/layout";
import { AutoComplete, Flex, Input, Menu, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";

export default function Navbar() {
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const MIN_SEARCH_CHARS = 1;

  const createDropdownItem = (product: Product) => {
    return (
      <Link to={`/products/${product.id}/${product.variants[0].id}`}>
        <Flex justify="space-between" align="center" className="w-full">
          <Space direction="horizontal" size="large">
            <img
              src={`${API_BASE_URL}/${product.variants[0].photoUrls[0]}`}
              className="w-20 object-cover"
            />
            <Typography.Text>{product.name}</Typography.Text>
          </Space>
          <Typography.Text type="secondary" className="justify-self-end">{product.variants.length} options</Typography.Text>
        </Flex >
      </Link>
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(`${API_BASE_URL}/products`);
      const data: Product[] = await response.data;
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleSearch = (value: string) => {
    if (value.length >= MIN_SEARCH_CHARS) {
      const options = {
        keys: ['name'],
        threshold: 0.3,
        includeScore: true,
      };

      const fuse = new Fuse(products, options);
      const result = fuse.search(value);

      const filteredOptions = result.map(({ item }) => ({
        key: item.id,
        value: item.name,
        label: createDropdownItem(item),
      }));

      setOptions(filteredOptions);
    } else {
      setOptions([]);
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
        <Menu.Item key="3"><UserOutlined /> Account</Menu.Item>
      </Menu>
    </Header>
  );
}

