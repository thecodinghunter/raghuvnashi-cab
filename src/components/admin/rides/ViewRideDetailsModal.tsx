'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Ride } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

interface ViewRideDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}

export const ViewRideDetailsModal = ({ isOpen, onClose, ride }: ViewRideDetailsModalProps) => {
    const mapImage = getPlaceholderImage('map-background');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ride Details: <span className="font-mono text-primary text-base">{ride.id}</span></DialogTitle>
          <DialogDescription>
            Review the details of this ride. Created on {new Date(ride.createdAt).toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column: Details */}
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">User</h3>
                    <p>{ride.userName}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">Driver</h3>
                    <p>{ride.driverName}</p>
                </div>
                 <Separator/>
                <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">Pickup</h3>
                    <p>{ride.pickup}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">Dropoff</h3>
                    <p>{ride.dropoff}</p>
                </div>
                <Separator/>
                 <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">Fare</h3>
                    <p className="font-bold text-primary text-lg">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(ride.fare)}
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-muted-foreground text-sm">Date</h3>
                    <p>{new Date(ride.createdAt).toLocaleString()}</p>
                </div>
            </div>
            {/* Right Column: Map */}
            <div className="space-y-2">
                 <h3 className="font-semibold text-muted-foreground text-sm text-center">Route Map</h3>
                 <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    {mapImage && (
                        <Image 
                            src={mapImage.imageUrl} 
                            alt="Ride route map" 
                            fill 
                            className="object-cover"
                            data-ai-hint={mapImage.imageHint}
                        />
                    )}
                </div>
            </div>
        </div>
        {ride.status === 'Disputed' && (
            <DialogFooter>
                <Button variant="default">Mark as Resolved</Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
