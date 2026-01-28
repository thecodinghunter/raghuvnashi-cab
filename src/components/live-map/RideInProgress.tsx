
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Flag, MapPin } from 'lucide-react';
import type { Ride } from '@/lib/types';
import { motion } from 'framer-motion';

interface RideInProgressProps {
    ride: Ride;
    onEndRide: (ride: Ride) => void;
}

const RideInProgress = ({ ride, onEndRide }: RideInProgressProps) => {

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-10 p-4"
        >
            <Card className="w-full max-w-2xl mx-auto bg-background/80 backdrop-blur-xl border-t-2 border-primary">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2">
                        <Car />
                        Ride In Progress
                    </CardTitle>
                    <CardDescription>
                        Navigating to drop-off location.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-accent" />
                            <div>
                                <p className="font-semibold">Drop-off</p>
                                <p className="text-sm text-muted-foreground">{ride.dropoff}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg text-primary">
                                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(ride.fare)}
                            </p>
                            <p className="text-xs text-muted-foreground">Est. Fare</p>
                        </div>
                    </div>
                     <Button
                        size="lg"
                        className="w-full text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 neon-accent"
                        onClick={() => onEndRide(ride)}
                    >
                        <Flag className="mr-3" /> End Ride
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RideInProgress;
