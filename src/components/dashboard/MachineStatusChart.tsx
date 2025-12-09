import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface MachineStatusData {
    name: string
    value: number
    [key: string]: any // Allow index signature for recharts compatibility
}

interface MachineStatusChartProps {
    data: MachineStatusData[]
}

const COLORS: Record<string, string> = {
    active: 'hsl(142, 76%, 36%)',     // green
    inactive: 'hsl(0, 84%, 60%)',      // red
    maintenance: 'hsl(48, 96%, 53%)',  // yellow
}

const MachineStatusChartComponent = ({ data }: MachineStatusChartProps) => {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Machine Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name.toLowerCase()] || 'hsl(var(--primary))'}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// Memoize to prevent unnecessary re-renders
export const MachineStatusChart = memo(MachineStatusChartComponent, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MachineStatusChart.displayName = 'MachineStatusChart';
