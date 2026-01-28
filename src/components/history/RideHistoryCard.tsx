'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Car, CheckCircle, Clock, IndianRupee, MapPin, XCircle, AlertTriangle, TrafficCone } from 'lucide-react';
import type { Ride } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RideHistoryCardProps {
  ride: Ride;
  index: number;
  onClick: () => void;
}

const StatusInfo = ({ status }: { status: Ride['status'] }) => {
    switch (status) {
        case 'Completed':
            return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
        case 'Cancelled':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
        case 'Disputed':
            return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-300"><AlertTriangle className="mr-1 h-3 w-3" />Disputed</Badge>;
        case 'In Progress':
             return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><TrafficCone className="mr-1 h-3 w-3" />In Progress</Badge>
        default:
            return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Requested</Badge>;
    }
};

const RideHistoryCard = ({ ride, index, onClick }: RideHistoryCardProps) => {
    const rideDate = ride.createdAt instanceof Date ? ride.createdAt : ride.createdAt.toDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:bg-card/90 hover:shadow-primary/10 transition-all duration-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-lg w-24 text-center">
            <p className="text-sm font-bold text-primary">{format(rideDate, 'MMM')}</p>
            <p className="text-2xl font-bold">{format(rideDate, 'dd')}</p>
            <p className="text-xs text-muted-foreground">{format(rideDate, 'yyyy')}</p>
          </div>
          <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary"/>
                <p className="truncate">{ride.pickup}</p>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent"/>
                <p className="truncate">{ride.dropoff}</p>
            </div>
             <div className="flex items-center justify-between pt-1">
                <p className="font-bold text-lg flex items-center gap-1">
                    <IndianRupee className="h-5 w-5 text-primary"/>
                    {ride.fare.toFixed(2)}
                </p>
                <StatusInfo status={ride.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RideHistoryCard;
