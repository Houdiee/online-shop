import { Button, Flex, Form, Input, Layout, Card, Typography, notification } from "antd";
import Navbar from "../components/Navbar";
import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../main";
import { UserContext } from "../contexts/UserContext";
import { type User } from "../types/user";

const { Title, Text } = Typography;

type LoginRequest = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, values);
      const user: User = response.data;
      setUser(user);
      api.success({
        message: 'Login Successful',
        description: `Welcome back, ${user.firstName}!`,
        placement: 'bottomRight',
      });
      navigate('/products');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'An unexpected error occurred. Please try again.';
      api.error({
        message: 'Login Failed',
        description: errorMessage,
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout className="min-h-screen !bg-gray-100">
      {contextHolder}
      <Navbar />
      <Layout.Content className="flex-1 p-4 flex flex-col items-center justify-start h-screen">
        <Card className="max-w-md w-full rounded-lg shadow-lg !mt-20">
          <Flex vertical align="center" className="text-center mt-6">
            <Title level={3} className="!mb-1">Welcome Back</Title>
            <Text type="secondary">Please log in to your account</Text>
          </Flex>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <Input className="rounded-md" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password className="rounded-md" />
            </Form.Item>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="rounded-md"
                loading={loading}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Layout.Content>
    </Layout >
  );
};

export default LoginPage;

