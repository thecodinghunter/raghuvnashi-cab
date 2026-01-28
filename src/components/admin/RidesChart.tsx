
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface RidesChartProps {
    data: { date: string; rides: number }[];
}


const RidesChart = ({ data }: RidesChartProps) => {
  return (
    <div className="h-[350px] w-full">
         <ChartContainer config={{
            rides: {
                label: "Rides",
                color: "hsl(var(--primary))",
            },
         }} className="w-full h-full">
            <LineChart
                data={data}
                margin={{
                    top: 5, right: 10, left: -10, bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{ fill: 'hsla(var(--card))' }}
                    content={<ChartTooltipContent />}
                />
                <Legend />
                <Line type="monotone" dataKey="rides" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ChartContainer>
    </div>
  );
};

export default RidesChart;
