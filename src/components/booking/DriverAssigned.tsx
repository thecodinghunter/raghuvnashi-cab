import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Phone, X, KeyRound } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import type { DriverInfo } from './RideBookingWrapper';
import { Skeleton } from '../ui/skeleton';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface DriverAssignedProps {
    driver: DriverInfo;
    eta: number | null;
    otp: number | undefined;
    onReset: () => void;
}

const DriverAssigned = ({ driver, eta, otp, onReset }: DriverAssignedProps) => {
    if (!driver) return null;

    const driverImage = getPlaceholderImage(driver.imageId);

  return (
    <div className="flex flex-col items-center space-y-4 py-4 text-center">
        <p className="text-sm text-accent font-semibold">Your driver is confirmed!</p>
        <h3 className="text-2xl font-bold font-headline">
            {driver.name || `Driver ${driver.driverId.substring(0, 6)}`} is on the way!
        </h3>
        {eta !== null ? (
            <p className="text-muted-foreground">
                Estimated arrival in{' '}
                <span className="font-bold text-primary">{eta} minutes</span>
            </p>
        ) : (
            <Skeleton className="h-6 w-48"/>
        )}

        <Avatar className="h-24 w-24 border-4 border-primary">
            {driverImage && <AvatarImage src={driverImage.imageUrl} alt={driver.name} />}
            <AvatarFallback className="text-4xl">{driver.name ? driver.name.charAt(0) : 'D'}</AvatarFallback>
        </Avatar>
        
        <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-primary" fill="currentColor" />
            <span className="font-bold text-lg">5.0</span>
        </div>

        <div className="flex flex-col items-center text-lg">
            <span>{driver.vehicle.split('(')[0]}</span>
            <span className="text-muted-foreground">{driver.vehicle.split('(')[1].replace(')','')}</span>
        </div>

        {otp && (
          <Card className="w-full bg-secondary border-primary/50 border-dashed">
            <CardHeader className="p-4 text-center">
              <CardTitle className="flex items-center justify-center gap-2 font-headline text-primary">
                <KeyRound />
                Your OTP
              </CardTitle>
              <CardDescription>Share this code with your driver to start the ride.</CardDescription>
              <p className="text-4xl font-bold tracking-widest text-foreground pt-2">
                {otp}
              </p>
            </CardHeader>
          </Card>
        )}

        <div className="w-full grid grid-cols-2 gap-4 pt-4">
            <Button variant="outline" size="lg"><MessageSquare className="mr-2 h-5 w-5" /> Message</Button>
            <Button variant="outline" size="lg"><Phone className="mr-2 h-5 w-5" /> Call</Button>
        </div>

        <Button
            variant="destructive"
            className="w-full"
            onClick={onReset}
        >
            <X className="mr-2 h-4 w-4" /> Cancel Ride
        </Button>
    </div>
  );
};

export default DriverAssigned;
