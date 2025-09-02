import { useContext, useState, useEffect } from "react";
import { Card, Tabs, Form, Input, Table, Spin, Typography, Space, Tag, Layout } from "antd";
import { UserOutlined, CaretRightOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../main";
import { type Order } from "../types/order";


const orderColumns = [
  {
    title: "Order ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Total Cost",
    dataIndex: "totalCost",
    key: "totalCost",
    render: (totalCost: number) => `$${totalCost.toFixed(2)}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      let color = 'geekblue';
      if (status === 'completed') {
        color = 'green';
      } else if (status === 'cancelled') {
        color = 'red';
      }
      return (
        <Tag color={color} key={status}>
          {status}
        </Tag>
      );
    },
  },
  {
    title: "Ordered At",
    dataIndex: "orderedAt",
    key: "orderedAt",
    render: (date: Date) => new Date(date).toLocaleDateString(),
  },
];

const orderItemColumns = [
  {
    title: "Product Name",
    dataIndex: "productNameAtOrder",
    key: "productNameAtOrder",
  },
  {
    title: "Variant",
    dataIndex: "variantNameAtOrder",
    key: "variantNameAtOrder",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "priceAtOrder",
    key: "priceAtOrder",
    render: (price: number) => `$${price.toFixed(2)}`,
  },
];

export default function AccountCenter() {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.id) {
        setOrdersLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${user.id}/orders`);
          setOrders(response.data);
        } catch (error) {
          console.error("Failed to fetch user orders:", error);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const items = [
    {
      key: "personal-information",
      label: "Personal Information",
      children: (
        <Spin spinning={!user} tip="Loading personal info...">
          {user ? (
            <Form
              layout="vertical"
              initialValues={user}
              disabled
            >
              <Form.Item label="First Name" name="firstName">
                <Input />
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
              <Form.Item label="Role" name="role">
                <Input />
              </Form.Item>
            </Form>
          ) : (
            <Typography.Text>No personal information available.</Typography.Text>
          )}
        </Spin>
      ),
    },
    {
      key: "orders",
      label: "Orders",
      children: (
        <Spin spinning={ordersLoading} tip="Loading orders...">
          {orders.length > 0 ? (
            <Table
              dataSource={orders}
              columns={orderColumns}
              rowKey="id"
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => (
                  <CaretRightOutlined
                    onClick={e => onExpand(record, e)}
                    style={{
                      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                  />
                ),
                expandedRowRender: (record) => (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Typography.Title level={5}>Order Items</Typography.Title>
                    <Table
                      columns={orderItemColumns}
                      dataSource={record.orderItems}
                      pagination={false}
                      rowKey="id"
                      size="small"
                    />
                  </Space>
                ),
              }}
            />
          ) : (
            <Typography.Text>You have no orders yet.</Typography.Text>
          )}
        </Spin>
      ),
    },
  ];

  return (
    <Layout>
      <Space direction="vertical" size="large">
        <Navbar />
        <div className="flex justify-center p-6 bg-gray-100">
          <Card
            title={(
              <Space>
                <UserOutlined />
                <span>Account Center</span>
              </Space>
            )}
            style={{ width: "100%", maxWidth: 800 }}
          >
            <Tabs items={items} />
          </Card>
        </div>
      </Space>
    </Layout >
  );
}

