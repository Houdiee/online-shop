import { Button, Checkbox, Flex, Form, Input, Layout, Card, Typography } from "antd";
import Navbar from "../components/Navbar";

const { Title, Text } = Typography;

const LoginPage = () => {
  const onFinish = (values) => {
    console.log('Success:', values);
    // Handle login logic here, e.g., send data to a server
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout className="min-h-screen !bg-gray-100">
      <Navbar />
      <Layout.Content className="flex-1 p-4 flex flex-col items-center justify-start h-screen">
        <Card className="max-w-md w-full rounded-lg shadow-lg !mt-20">
          <Flex vertical align="center" className="text-center mt-6">
            <Title level={3} className="!mb-1">Welcome Back!</Title>
            <Text type="secondary">Please log in to your account.</Text>
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
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
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
              <Button type="primary" htmlType="submit" size="large" block className="rounded-md">
                Log In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Layout.Content>
    </Layout>
  );
};

export default LoginPage;

