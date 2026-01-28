'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, IndianRupee, Check, X, Timer } from 'lucide-react';
import type { Ride } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface RideRequestModalProps {
    ride: Ride;
    onAccept: (ride: Ride) => void;
    onReject: (rideId: string) => void;
    onTimeout: (rideId: string) => void;
}

const REQUEST_TIMEOUT_SECONDS = 20;

const RideRequestModal = ({ ride, onAccept, onReject, onTimeout }: RideRequestModalProps) => {
    const [timeLeft, setTimeLeft] = useState(REQUEST_TIMEOUT_SECONDS);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeout(ride.id);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeout, ride.id]);

    const progressValue = (timeLeft / REQUEST_TIMEOUT_SECONDS) * 100;

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-[51] p-4"
        >
            <Card className="w-full max-w-2xl mx-auto bg-background/80 backdrop-blur-xl border-t-2 border-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary">New Ride Request!</CardTitle>
                    <CardDescription>A new ride is available nearby.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Timer className="h-5 w-5 text-primary"/>
                        <p>Time to accept:</p>
                        <Progress value={progressValue} className="w-1/3 h-3" />
                        <p className="font-bold text-primary">{timeLeft}s</p>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
                        <MapPin className="text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Pickup</p>
                            <p className="text-muted-foreground">{ride.pickup}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
                        <MapPin className="text-accent mt-1" />
                        <div>
                            <p className="font-semibold">Drop-off</p>
                            <p className="text-muted-foreground">{ride.dropoff}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg">
                         <p className="text-lg font-semibold">Estimated Fare:</p>
                         <p className="font-bold text-2xl text-primary flex items-center">
                            <IndianRupee className="h-6 w-6 mr-1" />
                            {isNaN(ride.fare) ? '—' : ride.fare.toFixed(2)}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="destructive" size="lg" onClick={() => onReject(ride.id)} className="text-lg">
                        <X className="mr-2" /> Reject
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={() => onAccept(ride)} 
                        className="text-lg bg-green-600 hover:bg-green-700 text-white neon-green"
                    >
                        <Check className="mr-2" /> Accept
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default RideRequestModal;
