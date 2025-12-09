import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthData {
  month: string;
  users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

const UserGrowthChartComponent = ({ data }: UserGrowthChartProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [`${value} users`, 'New Users']} />
            <Bar
              dataKey="users"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              name="New Users"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders
export const UserGrowthChart = memo(UserGrowthChartComponent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

UserGrowthChart.displayName = 'UserGrowthChart';
