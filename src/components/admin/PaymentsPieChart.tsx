
'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface PaymentsPieChartProps {
    data: { name: string; value: number; fill: string }[];
}

const PaymentsPieChart = ({ data }: PaymentsPieChartProps) => {
  return (
    <div className="h-[350px] w-full">
       <ChartContainer config={{}} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={{ fill: 'hsla(var(--card))' }}
                    content={<ChartTooltipContent />}
                 />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
       </ChartContainer>
    </div>
  );
};

export default PaymentsPieChart;
