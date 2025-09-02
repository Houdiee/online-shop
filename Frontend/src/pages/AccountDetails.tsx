import { useContext, useState, useEffect } from "react";
import { Card, Tabs, Form, Input, Table, Spin, Typography, Space, Tag, Layout, Button, message } from "antd";
import { UserOutlined, CaretRightOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../main";
import { type Order } from "../types/order";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/user";

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
  const { user, setUser } = useContext(UserContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const activeTab = location.pathname.split("/")[2] || "details";

  const handleTabChange = (key: string) => {
    navigate(`/account/${key}`);
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user, form]);

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

  const handleUpdateUser = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${user?.id}`, values);
      const updatedUser: User = response.data;
      setUser(updatedUser, localStorage.getItem("token"));
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update user:", error);
      message.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAdminAccess = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/users/request-admin-access`);
      message.success("Admin access request submitted!");
      if (user) {
        setUser({ ...user, isPendingAdmin: true }, localStorage.getItem("token"));
      }
    }
    catch (error) {
      console.error("Failed to request admin access:", error);
      message.error("Failed to submit admin access request.");
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    {
      key: "details",
      label: "Personal Information",
      children: (
        <Spin spinning={!user} tip="Loading personal info...">
          {user ? (
            <Form
              form={form}
              layout="vertical"
              initialValues={user}
              onFinish={handleUpdateUser}
            >
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item label="First Name" name="firstName">
                <Input />
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input />
              </Form.Item>
              <Form.Item label="Password" name="password">
                <Input.Password placeholder="Leave blank to keep current password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Save Changes
                </Button>
              </Form.Item>

              <Form.Item>
                <Button danger onClick={() => {
                  setUser(null, null);
                  navigate('/login');
                }}>
                  Logout
                </Button>
              </Form.Item>

              {user.role === "Customer" && !user.isPendingAdmin && (
                <Form.Item>
                  <Button type="default" onClick={handleRequestAdminAccess} loading={submitting}>
                    Request Admin Access
                  </Button>
                </Form.Item>
              )}

              {user.isPendingAdmin && (
                <Typography.Text type="warning">
                  Your admin access request is pending approval.
                </Typography.Text>
              )}
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
              dataSource={orders.slice().reverse()}
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
    <Layout className="h-screen">
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
            <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
          </Card>
        </div>
      </Space>
    </Layout >
  );
}

