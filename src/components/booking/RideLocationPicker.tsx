'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleDot, MapPin, X, ArrowRight, LocateFixed, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { getDistance } from '@/lib/utils';
import type { Location } from './RideBookingWrapper';
import { useToast } from '@/hooks/use-toast';

interface RideLocationPickerProps {
  onLocationsSelected: (pickup: any, drop: any) => void;
}

const SearchResults = ({ results, onSelect }: { results: any[]; onSelect: (loc: any) => void }) => (
  <AnimatePresence>
    {results.length > 0 && (
      <motion.ul
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-[1001] bg-background w-full rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto border"
      >
        {results.map((loc, i) => (
          <li
            key={loc.place_id}
            onClick={() => onSelect(loc)}
            className="p-3 text-sm cursor-pointer hover:bg-secondary border-b last:border-none"
          >
            <span className="font-semibold">{loc.name}</span>
            <p className="text-xs text-muted-foreground">{(loc.display_name || '').split(',').slice(1).join(',')}</p>
          </li>
        ))}
      </motion.ul>
    )}
  </AnimatePresence>
);

const LocationInput = ({
  value,
  onValueChange,
  placeholder,
  type,
  isActive,
  onFocus,
  onSelect,
  onClear,
  userPosition,
  userLocality,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  type: 'pickup' | 'drop';
  isActive: boolean;
  onFocus: () => void;
  onSelect: (loc: any) => void;
  onClear: () => void;
  userPosition: { lat: number; lon: number } | null;
  userLocality: string | null;
}) => {
  const [results, setResults] = useState<any[]>([]);

  const fetchLocations = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'ec8570c3466f4e399ff99fab00a25115';

        // If we have a detected locality, append it to the query to favor local matches
        let searchText = query;
        if (userLocality && !query.toLowerCase().includes(userLocality.toLowerCase())) {
          searchText = `${query}, ${userLocality}`;
        }

        let geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          searchText,
        )}&apiKey=${geoapifyApiKey}&limit=10&country=IN`;

        if (userPosition) {
          const lon = userPosition.lon;
          const lat = userPosition.lat;
          geoapifyUrl += `&bias=proximity:lonlat:${lon},${lat}`;
          // tighter 5 km radius
          geoapifyUrl += `&filter=circle:${lon},${lat},5000`;
        }

        const res = await fetch(geoapifyUrl);
        const data = await res.json();

        if (data && Array.isArray(data.features) && data.features.length > 0) {
          let mapped = data.features.map((feature: any, idx: number) => ({
            place_id: feature.properties.place_id || `${Date.now()}_${idx}`,
            name: feature.properties.name || feature.properties.address_line1 || '',
            display_name: feature.properties.formatted || feature.properties.address_line1 || '',
            lat: feature.geometry.coordinates[1] || 0,
            lon: feature.geometry.coordinates[0] || 0,
          }));

          // If few results, use Places API fallback (richer POI results)
          if (mapped.length < 6 && userPosition) {
            try {
              const lon = userPosition.lon;
              const lat = userPosition.lat;
              const placesUrl = `https://api.geoapify.com/v2/places?text=${encodeURIComponent(
                query,
              )}&filter=circle:${lon},${lat},5000&limit=20&apiKey=${geoapifyApiKey}`;
              const placesRes = await fetch(placesUrl);
              const placesJson = await placesRes.json();
              if (placesJson && Array.isArray(placesJson.features) && placesJson.features.length > 0) {
                const placesMapped = placesJson.features.map((feature: any, idx: number) => ({
                  place_id: feature.properties.place_id || `place_${Date.now()}_${idx}`,
                  name: feature.properties.name || feature.properties.address_line1 || '',
                  display_name: feature.properties.formatted || feature.properties.address_line1 || '',
                  lat: feature.geometry.coordinates[1] || 0,
                  lon: feature.geometry.coordinates[0] || 0,
                }));
                const seen = new Set(mapped.map((m: any) => `${m.lat}_${m.lon}_${m.name}`));
                for (const p of placesMapped) {
                  const key = `${p.lat}_${p.lon}_${p.name}`;
                  if (!seen.has(key)) {
                    mapped.push(p);
                    seen.add(key);
                  }
                }
              }
            } catch (err) {
              // ignore places fallback errors
            }
          }

          setResults(mapped);
          console.log('Geoapify results:', mapped);
          return;
        }

        // Nominatim fallback (bounded to user area if available, otherwise Gujarat bbox)
        const nominatimParams = new URLSearchParams({
          format: 'json',
          q: query,
          addressdetails: '1',
          limit: '5',
          countrycodes: 'in',
        });

        if (userPosition) {
          const delta = 0.25;
          const left = (userPosition.lon - delta).toFixed(6);
          const right = (userPosition.lon + delta).toFixed(6);
          const top = (userPosition.lat + delta).toFixed(6);
          const bottom = (userPosition.lat - delta).toFixed(6);
          nominatimParams.set('viewbox', `${left},${top},${right},${bottom}`);
          nominatimParams.set('bounded', '1');
        } else {
          nominatimParams.set('viewbox', `68.000000,24.750000,74.700000,20.000000`);
          nominatimParams.set('bounded', '1');
        }

        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?${nominatimParams.toString()}`);
        const fallbackData = await fallbackRes.json();
        setResults(fallbackData);
        console.log('Nominatim fallback results:', fallbackData);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    },
    [userPosition, userLocality],
  );

  useEffect(() => {
    const typingTimer = setTimeout(() => {
      if (isActive) {
        fetchLocations(value);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(typingTimer);
  }, [value, fetchLocations, isActive]);

  const handleSelect = (loc: any) => {
    onSelect(loc);
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <div className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10', type === 'pickup' ? 'text-primary' : 'text-accent')}>
        {type === 'pickup' ? <CircleDot /> : <MapPin />}
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={onFocus}
        className={cn(
          'w-full bg-secondary/50 border h-14 pl-10 text-base transition-all',
          isActive ? 'ring-2 ring-primary border-primary' : 'border-transparent focus-visible:ring-primary',
        )}
      />
      {value && (
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
      {isActive && <SearchResults results={results} onSelect={handleSelect} />}
    </div>
  );
};

export default function RideLocationPicker({ onLocationsSelected }: RideLocationPickerProps) {
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropQuery, setDropQuery] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop' | null>('pickup');
  const [isLocating, setIsLocating] = useState(false);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [drop, setDrop] = useState<Location | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [userLocality, setUserLocality] = useState<string | null>(null);
  const { toast } = useToast();

  // Capture user geolocation on mount for search proximity biasing
  useEffect(() => {
    if (!navigator.geolocation) return;
    let mounted = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserPosition({ lat, lon });

        // Reverse-geocode once to capture a city/locality for stronger autocomplete bias
        (async () => {
          try {
            const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'ec8570c3466f4e399ff99fab00a25115';
            const rsp = await fetch(`https://api.geoapify.com/v1/geocode/search?lat=${lat}&lon=${lon}&apiKey=${geoapifyApiKey}`);
            const json = await rsp.json();
            if (json && Array.isArray(json.features) && json.features.length > 0) {
              const props = json.features[0].properties || {};
              const locality = props.city || props.town || props.village || props.county || props.state || null;
              if (locality) setUserLocality(locality);
            }
          } catch (err) {
            // ignore
          }
        })();
      },
      () => {
        // ignore errors; search will still work with fallback to Gujarat bbox
      },
      { maximumAge: 60 * 60 * 1000, timeout: 5000 },
    );
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setPickupQuery(pickup ? pickup.display_name : '');
  }, [pickup]);

  useEffect(() => {
    setDropQuery(drop ? drop.display_name : '');
  }, [drop]);

  const distance = useMemo(() => {
    if (pickup && drop) {
      return getDistance({ latitude: parseFloat(pickup.lat as any), longitude: parseFloat(pickup.lon as any) }, { latitude: parseFloat(drop.lat as any), longitude: parseFloat(drop.lon as any) });
    }
    return null;
  }, [pickup, drop]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'ec8570c3466f4e399ff99fab00a25115';
          fetch(`https://api.geoapify.com/v1/geocode/search?lat=${latitude}&lon=${longitude}&apiKey=${geoapifyApiKey}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && Array.isArray(data.features) && data.features.length > 0) {
                const feature = data.features[0];
                const newLocation: Location = {
                  place_id: feature.properties.place_id || `${Date.now()}`,
                  lat: latitude,
                  lon: longitude,
                  display_name: feature.properties.formatted || feature.properties.address_line1 || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
                  name: feature.properties.name || feature.properties.address_line1 || '',
                };
                setPickup(newLocation);
                if (!drop) setActiveInput('drop');
              } else {
                throw new Error('No address found');
              }
            })
            .catch((err) => {
              console.error('Geoapify reverse geocoding error:', err);
              toast({
                variant: 'destructive',
                title: 'Could not fetch name',
                description: 'Using coordinates as location name.',
              });
              const newLocation: Location = {
                lat: latitude,
                lon: longitude,
                display_name: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
              };
              setPickup(newLocation);
              if (!drop) setActiveInput('drop');
            })
            .finally(() => setIsLocating(false));
        },
        (error) => {
          setIsLocating(false);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Please enable location services.',
          });
        },
      );
    } else {
      setIsLocating(false);
      toast({
        variant: 'destructive',
        title: 'Location Not Supported',
        description: 'Your browser does not support geolocation.',
      });
    }
  };

  const handleSwapLocations = () => {
    const tempPickup = pickup;
    setPickup(drop);
    setDrop(tempPickup);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-grow space-y-2 relative">
          <LocationInput
            placeholder="Enter pickup location"
            value={pickupQuery}
            onValueChange={setPickupQuery}
            type="pickup"
            isActive={activeInput === 'pickup'}
            onFocus={() => setActiveInput('pickup')}
            onSelect={(loc) => {
              setPickup(loc);
              if (!drop) setActiveInput('drop');
              else setActiveInput(null);
            }}
            onClear={() => {
              setPickup(null);
              setPickupQuery('');
            }}
            userPosition={userPosition}
            userLocality={userLocality}
          />
          <LocationInput
            placeholder="Enter drop-off location"
            value={dropQuery}
            onValueChange={setDropQuery}
            type="drop"
            isActive={activeInput === 'drop'}
            onFocus={() => setActiveInput('drop')}
            onSelect={(loc) => {
              setDrop(loc);
              setActiveInput(null);
            }}
            onClear={() => {
              setDrop(null);
              setDropQuery('');
            }}
            userPosition={userPosition}
            userLocality={userLocality}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 p-2">
            <Button variant="ghost" size="icon" onClick={handleSwapLocations} className="h-8 w-8 bg-background/80 hover:bg-background rounded-full border">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button size="icon" className="h-14 w-14 shrink-0" onClick={handleGetCurrentLocation} disabled={isLocating}>
          {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
        </Button>
      </div>

      {distance !== null && (
        <div className="text-center">
          <Badge variant="secondary">Distance: {distance.toFixed(2)} km</Badge>
        </div>
      )}

      <Button size="lg" className="w-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onLocationsSelected(pickup, drop)} disabled={!pickup || !drop}>
        <ArrowRight className="mr-2 h-5 w-5" />
        See Ride Options
      </Button>
    </div>
  );
}
