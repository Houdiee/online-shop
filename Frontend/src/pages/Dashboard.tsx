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
  Divider,
} from 'antd';
import { API_BASE_URL } from '../main';
import StatisticCard from '../components/admin/StatisticCard';

const { Title } = Typography;
const { Option } = Select;

// New interface for the most popular products, matching the C# record
interface MostPopularProductStats {
  productName: string;
  totalSales: number;
  totalRevenue: number;
}

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
  // Updated type to use the new interface
  mostPopularProducts: MostPopularProductStats[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // State for each individual statistic's timeframe
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
    mostPopularProducts,
  } = dashboardData;

  const getLabel = (timeFrame: string) => {
    return timeFrame.replace('days', ' Days').replace('24hours', '24 Hours');
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <div className="flex justify-between items-center mb-8">
          <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
        </div>

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

        {/* New Popular Products & Other Stats */}
        <Row gutter={[24, 24]}>
          {/* Most Popular Products Table Card */}
          <Col xs={24} lg={16}>
            <Card title="Most Popular Products" className="h-full">
              <List
                itemLayout="horizontal"
                dataSource={mostPopularProducts}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.productName}
                      description={
                        <div>
                          <p className="m-0">
                            <strong>Sales:</strong> {item.totalSales} units
                          </p>
                          <p className="m-0">
                            <strong>Revenue:</strong> ${item.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No popular products to display.' }}
              />
            </Card>
          </Col>

          {/* Combined Stock & Tags Card */}
          <Col xs={24} lg={8}>
            <Card title="Inventory & Tags" className="h-full">
              <span className="font-semibold block mb-2">Low Stock Products:</span>
              <div className="mb-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((item, index) => (
                    <Tag key={index} color="warning" className="mb-1">{item}</Tag>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">All products are well-stocked!</p>
                )}
              </div>
              <Divider className="my-2" />
              <span className="font-semibold block mb-2">Out of Stock Products:</span>
              <div className="mb-4">
                {outOfStockProducts.length > 0 ? (
                  outOfStockProducts.map((item, index) => (
                    <Tag key={index} color="error" className="mb-1">{item}</Tag>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No products are out of stock!</p>
                )}
              </div>
              <Divider className="my-2" />
              <span className="font-semibold block mb-2">Top Tags Used:</span>
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

