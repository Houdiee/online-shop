import { useContext, useEffect, useState } from "react";
import type { Product } from "../types/product";
import axios from "axios";
import { Header } from "antd/es/layout/layout";
import { AutoComplete, Flex, Input, Menu, Space, Typography } from "antd";
import { PlusOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { API_BASE_URL } from "../main";
import CartMenu from "./CartMenu";
import type { ShoppingCart } from "../types/shopping-cart";
import { UserContext } from "../contexts/UserContext";

interface NavbarProps {
  productsData?: Product[];
  shoppingCartData?: ShoppingCart;
};

export default function Navbar({ productsData, shoppingCartData }: NavbarProps) {
  const { user } = useContext(UserContext);
  const [searchValue, setSearchValue] = useState<string>("");
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const MIN_SEARCH_CHARS = 1;

  const location = useLocation();
  const navigate = useNavigate();

  const createDropdownItem = (product: Product) => {
    return (
      <Link to={`/products/${product.id}/${product.variants[0].id}`}>
        <Flex justify="space-between" align="center" className="w-full">
          <Space direction="horizontal" size="large">
            <img
              src={`${API_BASE_URL}/${product.variants[0].photoUrls[0]}`}
              className="w-20 object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/80x80/cccccc/333333?text=No+Image`;
              }}
            />
            <Typography.Text>{product.name}</Typography.Text>
          </Space>
          <Typography.Text type="secondary" className="justify-self-end">{product.variants.length} options</Typography.Text>
        </Flex>
      </Link>
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        const data: Product[] = response.data;
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    if (!productsData) {
      fetchProducts();
    } else {
      setProducts(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearchValue = params.get("search");

    if (urlSearchValue !== null && urlSearchValue !== searchValue) {
      setSearchValue(urlSearchValue);
      handleSearch(urlSearchValue);
    } else if (urlSearchValue === null && searchValue !== "") {
      setSearchValue("");
      setOptions([]);
    }
  }, [location.search, products]);

  const handleSearch = (value: string) => {
    if (value.length >= MIN_SEARCH_CHARS && products.length > 0) {
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const newSearchParam = searchValue ? `?search=${searchValue}` : '';
      navigate({ search: newSearchParam });
      setOptions([]);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      setIsSidebarOpen(true);
    }
  };

  const handleAccountClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/account');
    }
  };

  return (
    <>
      <Header className="!bg-white flex items-center justify-between px-4">
        {/* Left-aligned menu */}
        <Menu
          mode="horizontal"
          className="flex-1 min-w-0 border-b-0 !p-0 !h-auto"
        >
          {user?.role === "admin" && (<Menu.Item key="create-product">
            <Link to="/admin/dashboard">
              Dashboard
            </Link>
          </Menu.Item>)}
          <Menu.Item key="featured">
            <Link to="/products">Featured</Link>
          </Menu.Item>
        </Menu>

        {/* Center-aligned search bar */}
        <div className="flex-none w-1/2 flex justify-center">
          <AutoComplete
            className="w-full"
            options={options}
            value={searchValue}
            onSearch={handleSearch}
            onChange={(value) => setSearchValue(value)}
            placeholder="Search"
            onKeyDown={handleKeyDown}
          >
            <Input.Search />
          </AutoComplete>
        </div>

        {/* Right-aligned menu with cart icon */}
        <Menu
          mode="horizontal"
          className="flex-1 min-w-0 border-b-0 !p-0 !h-auto justify-end"
        >
          {user?.role === "admin" && (<Menu.Item key="create-product">
            <Link to="/admin/create">
              <PlusOutlined /> Create New
            </Link>
          </Menu.Item>)}

          <Menu.Item key="account" onClick={handleAccountClick}>
            <UserOutlined /> Account
          </Menu.Item>
          <Menu.Item key="cart" onClick={handleCartClick}>
            <ShoppingCartOutlined /> Cart
          </Menu.Item>
        </Menu>
      </Header>

      <CartMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shoppingCartData={shoppingCartData}
      />
    </>
  );
}

