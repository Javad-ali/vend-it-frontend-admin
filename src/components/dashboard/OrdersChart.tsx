import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OrderData {
    date: string
    orders: number
}

interface OrdersChartProps {
    data: OrderData[]
}

const OrdersChartComponent = ({ data }: OrdersChartProps) => {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: number) => [`${value} orders`, 'Orders']}
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            name="Orders"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// Memoize to prevent unnecessary re-renders
export const OrdersChart = memo(OrdersChartComponent, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

OrdersChart.displayName = 'OrdersChart';
