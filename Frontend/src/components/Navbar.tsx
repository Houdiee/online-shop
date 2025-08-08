import { UserOutlined } from "@ant-design/icons";
import { Input, Menu, type MenuProps } from "antd";

type MenuItem = Required<MenuProps>['items'][number];

export default function Navbar() {

  const items: MenuItem[] = [
    {
      key: "search-input",
      label: <Input.Search />,
    },
    {
      key: "account",
      icon: <UserOutlined />,
    },
  ];

  return (
    <>
      <Menu
        mode="horizontal"
        items={items}
        className="justify-end !items-center"
      />
    </>
  );
}
