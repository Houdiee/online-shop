import { Button, Flex, Form, Input, Layout, Card, Typography, notification } from "antd";
import Navbar from "../components/Navbar";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../main";

const { Title, Text } = Typography;

type SignupRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const onFinish = async (values: SignupRequest) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/users`, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: "Customer",
      });
      api.success({
        message: 'Registration Successful',
        description: 'Your account has been created. Please log in.',
        placement: 'bottomRight',
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'An unexpected error occurred. Please try again.';
      api.error({
        message: 'Registration Failed',
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
            <Title level={3} className="!mb-1">Create an Account</Title>
            <Text type="secondary">Sign up to get started</Text>
          </Flex>
          <Form
            name="signup"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please input your first name!' }]}
            >
              <Input className="rounded-md" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please input your last name!' }]}
            >
              <Input className="rounded-md" />
            </Form.Item>

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
                Sign Up
              </Button>
            </Form.Item>

            <Flex justify="center" className="mt-4">
              <Text>Already have an account? <Link to="/login">Log in</Link></Text>
            </Flex>
          </Form>
        </Card>
      </Layout.Content>
    </Layout >
  );
};

export default SignupPage;
