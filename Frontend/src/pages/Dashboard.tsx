import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  List,
  Spin,
  Layout,
} from 'antd';
import axios from 'axios';
import { API_BASE_URL } from '../main';
import StatisticCard from '../components/admin/StatisticsCard';
import Navbar from '../components/Navbar';

interface Dashboard {
  productsSoldLast7Days: number;
  totalRevenueLast7Days: number;
  pendingOrders: number;
  completedOrdersLast7Days: number;
  totalRegisteredUsers: number;
  totalProducts: number;
  lowStockProducts: string[];
  outOfStockProducts: string[];
  topTagsUsed: string[];
}

const { Title } = Typography;

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard`);
        const dashboardData: Dashboard = response.data;
        setDashboardData(dashboardData);

        setTimeout(() => {
          setDashboardData(dashboardData);
          setLoading(false);
        }, 1500);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  const {
    productsSoldLast7Days,
    totalRevenueLast7Days,
    pendingOrders,
    completedOrdersLast7Days,
    totalRegisteredUsers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    topTagsUsed,
  } = dashboardData;

  return (
    <Layout>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Products Sold (7 Days)"
              value={productsSoldLast7Days}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Total Revenue (7 Days)"
              value={totalRevenueLast7Days}
              precision={2}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Pending Orders"
              value={pendingOrders}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Completed Orders (7 Days)"
              value={completedOrdersLast7Days}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Total Registered Users"
              value={totalRegisteredUsers}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <StatisticCard
              title="Total Products"
              value={totalProducts}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Stock Alerts" className="h-full">
              <List
                header={<span className="font-semibold">Low Stock Products:</span>}
                bordered={false}
                dataSource={lowStockProducts}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                locale={{ emptyText: 'All products are well-stocked!' }}
              />
              <List
                header={<span className="font-semibold mt-4 block">Out of Stock Products:</span>}
                bordered={false}
                dataSource={outOfStockProducts}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                locale={{ emptyText: 'No products are out of stock!' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Top Tags Used" className="h-full">
              <div className="flex flex-wrap gap-2">
                {topTagsUsed.length > 0 ? (
                  topTagsUsed.map((tag, index) => (
                    <Tag color={['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'][index % 11]} key={index}>
                      {tag}
                    </Tag>
                  ))
                ) : (
                  <p className="text-gray-500">No tags have been used yet.</p>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

