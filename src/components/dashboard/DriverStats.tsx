
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedCounter from '@/components/admin/AnimatedCounter';
import { IndianRupee, Car } from 'lucide-react';
import { cn } from '@/lib/utils';


type DashboardData = {
  totalRidesToday: number;
  todaysEarnings: number;
};

interface DriverStatsProps {
    data: DashboardData | undefined;
}

const StatCard = ({ title, value, icon: Icon, children, className }: { title: string, value: React.ReactNode, icon: React.ElementType, children?: React.ReactNode, className?: string }) => (
    <Card className={cn("transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 flex flex-col", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {title}
            </CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
            <div className="text-3xl font-bold">
                {value}
            </div>
            {children && <div className="text-xs text-muted-foreground mt-1">{children}</div>}
        </CardContent>
    </Card>
);

const DriverStats = ({ data }: DriverStatsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard title="Today's Earnings" icon={IndianRupee} value={
             <div className="flex items-center">
                <span className="mr-1">₹</span>
                <AnimatedCounter from={0} to={data?.todaysEarnings ?? 0} fractionDigits={2} />
            </div>
          }>
            <p>From all completed rides today</p>
          </StatCard>
          <StatCard title="Total Rides Today" icon={Car} value={
            <AnimatedCounter from={0} to={data?.totalRidesToday ?? 0} />
          }>
            <p>Live count for today</p>
          </StatCard>
        </div>
    )
}

export default DriverStats;
