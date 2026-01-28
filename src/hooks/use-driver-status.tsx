'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Driver Status Context
interface DriverStatusContextType {
  isOnline: boolean;
  driverPosition: L.LatLngExpression | null;
  canGoOnline: boolean;
  setCanGoOnline: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleOnline: (online: boolean) => void;
  onlineSince: Date | null;
}

const DriverStatusContext = createContext<DriverStatusContextType | undefined>(undefined);

export const useDriverStatus = () => {
  const context = useContext(DriverStatusContext);
  if (context === undefined) {
    throw new Error('useDriverStatus must be used within a DriverStatusProvider');
  }
  return context;
};

export const DriverStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [driverPosition, setDriverPosition] = useState<L.LatLngExpression | null>(null);
  const { toast } = useToast();
  const [canGoOnline, setCanGoOnline] = useState(false);
  const [onlineSince, setOnlineSince] = useState<Date | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleToggleOnline = useCallback((online: boolean) => {
    if (online) {
      if (!canGoOnline) {
        toast({
            variant: 'destructive',
            title: 'Location Not Supported',
            description: 'Your browser does not support geolocation.',
        });
        return;
      }
      setIsOnline(true);
      setOnlineSince(new Date());
    } else {
        setIsOnline(false);
        setOnlineSince(null);
    }
  }, [canGoOnline, toast]);

  // Effect to update driver location in Firestore
  useEffect(() => {
    if (isOnline && driverPosition && user && firestore) {
      const locationDocRef = doc(firestore, 'driverLocations', user.uid);
      const locationData = {
          location: {
              latitude: Array.isArray(driverPosition) ? driverPosition[0] : driverPosition.lat,
              longitude: Array.isArray(driverPosition) ? driverPosition[1] : driverPosition.lng,
          },
          updatedAt: serverTimestamp(),
      };
      setDoc(locationDocRef, locationData, { merge: true }).catch((error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: locationDocRef.path,
              operation: 'write',
              requestResourceData: locationData,
          }));
          toast({ variant: 'destructive', title: 'Location Error', description: 'Could not update your live location.' });
      });
    }
  }, [driverPosition, isOnline, user, firestore, toast]);

  useEffect(() => {
    let watchId: number | null = null;
    
    if (isOnline && canGoOnline) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setDriverPosition([latitude, longitude]);
            },
            (error) => {
                console.error("Error getting driver's location:", error);
                toast({
                    variant: 'destructive',
                    title: 'Location Error',
                    description: 'Could not get your location. Please enable location services.',
                });
                setIsOnline(false); // Force offline if location fails
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
        setDriverPosition(null);
    }

    return () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    };
  }, [isOnline, canGoOnline, toast]);

  const value = {
    isOnline,
    driverPosition,
    canGoOnline,
    setCanGoOnline,
    handleToggleOnline,
    onlineSince,
  };

  return (
    <DriverStatusContext.Provider value={value}>
      {children}
    </DriverStatusContext.Provider>
  );
};
