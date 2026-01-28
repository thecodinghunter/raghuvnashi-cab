'use client';

import { useEffect, useState } from 'react';
import SearchingState from './SearchingState';
import DriverAssigned from './DriverAssigned';
import { useToast } from '@/hooks/use-toast';
import { cn, getDistance } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import RideLocationPicker from './RideLocationPicker';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Ride } from '@/lib/types';
import RideOptions from './RideOptions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { driverDetails } from '@/lib/data';
import L from 'leaflet';
import { useDoc } from '@/firebase/firestore/use-doc';

const LiveMap = dynamic(() => import('@/components/live-map/LiveMap'), {
  ssr: false,
});

type Stage = 'INITIAL' | 'OPTIONS' | 'SEARCHING' | 'ASSIGNED' | 'ERROR';
export type DriverInfo = {
  driverId: string;
  name: string;
  vehicle: string;
  imageId: string;
};

export type Location = {
  lat: number;
  lon: number;
  display_name: string;
  place_id?: string;
  name?: string;
};

const RideBookingWrapper = ({ user }: { user: User }) => {
  const [stage, setStage] = useState<Stage>('INITIAL');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<DriverInfo | null>(null);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [drop, setDrop] = useState<Location | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const firestore = useFirestore();

  const [driverPosition, setDriverPosition] = useState<L.LatLngExpression | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => setIsClient(true), []);

  const activeRideRef = useMemoFirebase(() => {
    if (!firestore || !activeRideId) return null;
    return doc(firestore, 'rides', activeRideId);
  }, [firestore, activeRideId]);

  const { data: rideData } = useDoc<Ride>(activeRideRef);

  // Listen to driver’s live location
  const driverLocationRef = useMemoFirebase(() => {
    if (!firestore || !assignedDriver) return null;
    return doc(firestore, 'driverLocations', assignedDriver.driverId);
  }, [firestore, assignedDriver]);

  const { data: driverLocationData } = useDoc<{
    location: { latitude: number; longitude: number };
  }>(driverLocationRef);

  useEffect(() => {
    if (driverLocationData && pickup) {
      const position: L.LatLngExpression = [
        driverLocationData.location.latitude,
        driverLocationData.location.longitude,
      ];
      setDriverPosition(position);

      const distance = getDistance(
        {
          latitude: driverLocationData.location.latitude,
          longitude: driverLocationData.location.longitude,
        },
        { latitude: pickup.lat, longitude: pickup.lon }
      );
      const averageSpeed = 40; // km/h
      const timeMinutes = Math.round((distance / averageSpeed) * 60);
      setEta(timeMinutes);
    }
  }, [driverLocationData, pickup]);

  // === 🔥 Realtime listener for ride updates ===
  useEffect(() => {
    if (!rideData) return;

    // ✅ When driver accepts ride
    if (
      (rideData.status === 'Accepted' || rideData.status === 'In Progress') &&
      rideData.driverId
    ) {
      const driverInfo = driverDetails[rideData.driverId as keyof typeof driverDetails];
      if (driverInfo) {
        setAssignedDriver({
          driverId: rideData.driverId,
          name: rideData.driverName || 'Jalaram Driver',
          vehicle: driverInfo.vehicle,
          imageId: driverInfo.imageId,
        });
        setStage('ASSIGNED');
      }
    }

    // ❌ Ride cancelled
    if (rideData.status === 'Cancelled') {
      toast({ title: 'Ride Cancelled', description: 'This ride has been cancelled.' });
      handleReset();
    }

    // ✅ Ride completed
    if (rideData.status === 'Completed') {
      toast({ title: 'Ride Completed!', description: 'Thanks for riding with us.' });
      handleReset();
    }
  }, [rideData, toast]);

  // === Handle selecting pickup & drop ===
  const handleLocationsSelected = (selectedPickup: Location, selectedDrop: Location) => {
    if (!selectedPickup || !selectedDrop) {
      toast({
        variant: 'destructive',
        title: 'Missing Locations',
        description: 'Please select both pickup and drop-off locations.',
      });
      return;
    }
    setPickup(selectedPickup);
    setDrop(selectedDrop);
    setStage('OPTIONS');
  };

  // === Handle Find Driver (create ride) ===
  const handleFindDriver = async (preferences: {
    preferredVehicleType?: string;
    fare: number;
  }) => {
    if (!pickup || !drop || !firestore) return;
    setStage('SEARCHING');

    const rideRequest = {
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      pickup: pickup.display_name,
      dropoff: drop.display_name,
      pickupCoords: { lat: pickup.lat, lon: pickup.lon },
      dropoffCoords: { lat: drop.lat, lon: drop.lon },
      status: 'Requested',
      driverId: null,
      driverName: null,
      createdAt: serverTimestamp(),
      fare: isNaN(preferences.fare) ? 0 : preferences.fare,
      vehicleType: preferences.preferredVehicleType,
    };

    try {
      const ridesCol = collection(firestore, 'rides');
      const docRef = await addDoc(ridesCol, rideRequest);
      setActiveRideId(docRef.id);
    } catch (error) {
      console.error('Error creating ride request:', error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'rides',
          operation: 'create',
          requestResourceData: rideRequest,
        })
      );
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description:
          'Could not submit your ride request. Please check permissions or try again.',
      });
      setStage('OPTIONS');
    }
  };

  const handleCancelRide = async () => {
    if (!activeRideId || !firestore) return;
    const rideRef = doc(firestore, 'rides', activeRideId);
    try {
      await updateDoc(rideRef, { status: 'Cancelled' });
      toast({ title: 'Ride Cancelled' });
      handleReset();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not cancel the ride.',
      });
    }
  };

  const handleReset = () => {
    setAssignedDriver(null);
    setActiveRideId(null);
    setPickup(null);
    setDrop(null);
    setDriverPosition(null);
    setEta(null);
    setStage('INITIAL');
  };

  const renderContent = () => {
    switch (stage) {
      case 'INITIAL':
        return <RideLocationPicker onLocationsSelected={handleLocationsSelected} />;
      case 'OPTIONS':
        return (
          <RideOptions
            onFindDriver={handleFindDriver}
            onBack={() => setStage('INITIAL')}
            pickup={pickup}
            drop={drop}
          />
        );
      case 'SEARCHING':
        return <SearchingState onCancel={handleCancelRide} />;
      case 'ASSIGNED':
        return assignedDriver ? (
          <DriverAssigned driver={assignedDriver} eta={eta} otp={rideData?.otp} onReset={handleCancelRide} />
        ) : (
          <SearchingState onCancel={handleCancelRide} />
        );
      case 'ERROR':
        return (
          <RideOptions
            onFindDriver={handleFindDriver}
            onBack={() => setStage('INITIAL')}
            pickup={pickup}
            drop={drop}
          />
        );
      default:
        return null;
    }
  };

  if (!isClient) return null;

  return (
    <>
      <LiveMap pickup={pickup} drop={drop} driverPosition={driverPosition} />
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 p-4 md:top-8 md:left-8 md:bottom-auto md:max-w-md md:w-full md:p-0'
        )}
      >
        <motion.div
          className="bg-background md:rounded-lg md:shadow-2xl md:border md:border-border/50 overflow-hidden"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RideBookingWrapper;
