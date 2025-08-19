import { Card, Statistic } from "antd";
import {
  ShoppingOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: number;
  precision?: number
};

export default function StatisticCard({ title, value, precision }: StatisticCardProps) {
  return (
    <Card hoverable className="ant-card-statistic">
      <Statistic
        title={title}
        value={precision !== undefined ? value.toFixed(precision) : value}
        prefix={getIcon(title)}
      />
    </Card>
  );
}

const getIcon = (title: string): ReactNode => {
  switch (title) {
    case 'Products Sold (7 Days)':
      return <ShoppingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    case 'Total Revenue (7 Days)':
      return <DollarCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
    case 'Pending Orders':
      return <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    case 'Completed Orders (7 Days)':
      return <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
    case 'Total Registered Users':
      return <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    case 'Total Products':
      return <BoxPlotOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    default:
      return null;
  }
};
