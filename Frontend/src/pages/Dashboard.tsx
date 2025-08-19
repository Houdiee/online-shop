import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  List,
  Spin,
  Select,
  Layout,
} from 'antd';
import { API_BASE_URL } from '../main';
import StatisticCard from '../components/admin/StatisticCard';
import Navbar from '../components/Navbar';

const { Title } = Typography;
const { Option } = Select;


interface DashboardData {
  productsSoldLast24Hours: number;
  productsSoldLast7Days: number;
  productsSoldLast30Days: number;
  totalRevenueLast24Hours: number;
  totalRevenueLast7Days: number;
  totalRevenueLast30Days: number;
  pendingOrders: number;
  completedOrdersLast24Hours: number;
  completedOrdersLast7Days: number;
  completedOrdersLast30Days: number;
  totalRegisteredUsers: number;
  newUsersLast24Hours: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalProducts: number;
  lowStockProducts: string[];
  outOfStockProducts: string[];
  topTagsUsed: string[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [productsSoldTimeFrame, setProductsSoldTimeFrame] = useState('7days');
  const [revenueTimeFrame, setRevenueTimeFrame] = useState('7days');
  const [completedOrdersTimeFrame, setCompletedOrdersTimeFrame] = useState('7days');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get<DashboardData>(`${API_BASE_URL}/dashboard`);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatisticValue = (timeFrame: string, metric: string) => {
    if (!dashboardData) return 0;
    switch (timeFrame) {
      case '24hours':
        return dashboardData[`${metric}Last24Hours` as keyof DashboardData] as number;
      case '30days':
        return dashboardData[`${metric}Last30Days` as keyof DashboardData] as number;
      case '7days':
      default:
        return dashboardData[`${metric}Last7Days` as keyof DashboardData] as number;
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  const {
    pendingOrders,
    totalRegisteredUsers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    topTagsUsed,
  } = dashboardData;

  const getLabel = (timeFrame: string) => {
    return timeFrame.replace('days', ' Days').replace('24hours', '24 Hours');
  };

  return (
    <Layout>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen font-sans">

        {/* Main Stats Grid */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="m-0 text-base font-medium">Products Sold</h3>
              <Select
                defaultValue="7days"
                style={{ width: 150 }}
                onChange={setProductsSoldTimeFrame}
              >
                <Option value="24hours">Last 24 Hours</Option>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
              </Select>
            </div>
            <StatisticCard
              title={`Products Sold (${getLabel(productsSoldTimeFrame)})`}
              value={getStatisticValue(productsSoldTimeFrame, 'productsSold')}
            />
          </Col>

          <Col xs={24} md={12} lg={8}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="m-0 text-base font-medium">Total Revenue</h3>
              <Select
                defaultValue="7days"
                style={{ width: 150 }}
                onChange={setRevenueTimeFrame}
              >
                <Option value="24hours">Last 24 Hours</Option>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
              </Select>
            </div>
            <StatisticCard
              title={`Total Revenue (${getLabel(revenueTimeFrame)})`}
              value={getStatisticValue(revenueTimeFrame, 'totalRevenue')}
              precision={2}
            />
          </Col>

          <Col xs={24} md={12} lg={8}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="m-0 text-base font-medium">Completed Orders</h3>
              <Select
                defaultValue="7days"
                style={{ width: 150 }}
                onChange={setCompletedOrdersTimeFrame}
              >
                <Option value="24hours">Last 24 Hours</Option>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
              </Select>
            </div>
            <StatisticCard
              title={`Completed Orders (${getLabel(completedOrdersTimeFrame)})`}
              value={getStatisticValue(completedOrdersTimeFrame, 'completedOrders')}
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

        {/* Stock Alerts & Top Tags */}
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

