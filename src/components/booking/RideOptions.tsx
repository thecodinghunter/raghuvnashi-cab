'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Shield, Star, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Location } from './RideBookingWrapper';
import { getDistance } from '@/lib/utils';


interface RideOptionsProps {
  onFindDriver: (preferences: {
    preferredVehicleType?: string;
    fare: number;
  }) => void;
  onBack: () => void;
  pickup: Location | null;
  drop: Location | null;
}

const rideTypes = [
  { name: 'Sedan', icon: Car, description: 'Affordable, everyday rides', baseFare: 50, perKm: 12 },
  { name: 'SUV', icon: Shield, description: 'Premium rides with top drivers', baseFare: 80, perKm: 18 },
  { name: 'Luxury', icon: Star, description: 'Spacious and comfortable', baseFare: 150, perKm: 25 },
];

const RideOptions = ({ onFindDriver, onBack, pickup, drop }: RideOptionsProps) => {
  const [selectedRide, setSelectedRide] = useState('Sedan');
  
  const distance = useMemo(() => {
    if (!pickup || !drop) return null;
    return getDistance(
        { latitude: pickup.lat, longitude: pickup.lon },
        { latitude: drop.lat, longitude: drop.lon }
    );
  }, [pickup, drop]);
  
  const fare = useMemo(() => {
    const rideType = rideTypes.find(r => r.name === selectedRide);
    if (!rideType || distance === null) return 0;
    // Simple fare calculation
    const calculatedFare = rideType.baseFare + (distance * rideType.perKm);
    return isNaN(calculatedFare) ? 0 : calculatedFare;
  }, [selectedRide, distance]);

  const handleRequestRide = () => {
    onFindDriver({
      preferredVehicleType: selectedRide,
      fare: fare
    });
  };

  return (
    <div className="space-y-6 py-4">
        <div className="relative flex items-center">
            <Button variant="ghost" size="icon" className="absolute -left-2" onClick={onBack}>
                <ArrowLeft className="h-5 w-5"/>
            </Button>
            <h3 className="text-center font-semibold text-lg flex-grow">Select a ride</h3>
        </div>

      <div className="grid grid-cols-3 gap-4">
        {rideTypes.map((ride) => (
          <button
            key={ride.name}
            onClick={() => setSelectedRide(ride.name)}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
              selectedRide === ride.name
                ? 'border-primary bg-primary/10'
                : 'border-transparent bg-card hover:bg-card/80'
            )}
          >
            <ride.icon className={cn(
                "h-8 w-8 mb-2",
                selectedRide === ride.name ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="font-bold">{ride.name}</span>
          </button>
        ))}
      </div>
      

      <Button
        size="lg"
        className="w-full font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleRequestRide}
      >
        {`Request ${selectedRide}`}
      </Button>
    </div>
  );
};

export default RideOptions;
