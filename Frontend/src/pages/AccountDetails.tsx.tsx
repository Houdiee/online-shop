import { Layout, Space } from "antd";
import Navbar from "../components/Navbar";

export default function AccountDetails() {
  return (
    <>
      <Layout>
        <Space direction="vertical" size="small">
          <Navbar />
        </Space>
      </Layout>
    </>
  );
}
