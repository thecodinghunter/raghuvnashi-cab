'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useCallback } from 'react';
import { renderToString } from 'react-dom/server';
import type { Location } from '../booking/RideBookingWrapper';

// Fix default Leaflet icons
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

const defaultCenter: L.LatLngExpression = [23.241999, 69.666932];

const AutoRickshawIcon = () => (
    <svg 
        viewBox="0 0 36 36" 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48"
        style={{filter: 'drop-shadow(0 0 4px hsl(var(--primary)))'}}
    >
        <path fill="hsl(var(--primary-foreground))" d="M19 9h2v11h-2z"></path>
        <path fill="hsl(var(--primary))" d="M10 9c-2 2-4 5-4 7c0 4 5 1 5 1V9z"></path>
        <circle cx="5" cy="32" r="4" fill="#292F33"></circle>
        <circle cx="5" cy="32" r="2" fill="#99AAB5"></circle>
        <path fill="#1E5200" d="M29 23h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m-10 0h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2"></path>
        <path fill="#5C913B" d="M2 28.377c-1.387.225-2.581-1.152-1-2.435c2-1.623 7-2.435 9-1.623S12 33 11 33s-4-5.435-9-4.623"></path>
        <path fill="hsl(var(--primary))" d="M11 33h13c1 0 2 0 2-2c0-1 1-4 3-4s5 3 5 4s0 2 1 2s1-1 1-2V19h-8c0 3-1 8-1 8s-1-1-1 1c0 .606-1 2-2 2h-1c-1 0-2-.666-2-1.672V19c0-1-2-1-2 0v9.328C19 29.334 18.262 30 17.341 30h-3.33C13 30 12 29 12 28v-9H5c0 6 5 14 6 14"></path>
        <path fill="#5C913B" d="M34 32c0 1 1 0 1-2c0-3-.833-5-5-5s-5 3-5 5c0 1 1 3 1 2s.667-2 4-2s4 1 4 2"></path>
        <path fill="hsl(var(--accent))" d="M12 19H5c0-1 1-3 1-3h4a1 1 0 0 0 1-1v-4s-2 0-2-2c0-.326.106-.652.25-.944C9.573 7.4 10.258 7 10.99 7H33c2 0 3 5 3 12h-8s0-8-3-8H12z"></path>
        <circle cx="30" cy="32" r="4" fill="#292F33"></circle>
        <circle cx="30" cy="32" r="2" fill="#99AAB5"></circle>
        <path fill="hsl(var(--accent))" d="M9 18.5v-1a.5.5 0 0 0-.5-.5H5.552C5.286 17.648 5 18.464 5 19h3.5a.5.5 0 0 0 .5-.5"></path>
    </svg>
);

const pickupIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dot"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const dropoffIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--accent))" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});


const createIcon = (iconComponent: React.ReactElement, size: [number, number] = [48, 48]) => {
  return L.divIcon({
    html: renderToString(iconComponent),
    className: 'bg-transparent border-none',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // Anchor at the bottom center
  });
};


const driverIcon = createIcon(<AutoRickshawIcon />);


interface LiveMapProps {
    driverPosition?: L.LatLngExpression | null;
    pickup?: Location | null;
    drop?: Location | null;
}

const LiveMap = ({ driverPosition, pickup, drop }: LiveMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const useGeoapifyRoutingRef = useRef<boolean>(true);
  const poiCategoryRef = useRef<string | null>(null);

  const getRoute = useCallback(async (start: L.LatLng, end: L.LatLng) => {
    try {
        const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        // If geoapify routing is enabled and key exists, use it
        if (useGeoapifyRoutingRef.current && geoapifyApiKey) {
          try {
            const waypoints = `${start.lat},${start.lng}|${end.lat},${end.lng}`;
            const url = `https://api.geoapify.com/v1/routing?waypoints=${encodeURIComponent(waypoints)}&mode=drive&apiKey=${geoapifyApiKey}`;
            console.log('Geoapify routing URL:', url);
            const res = await fetch(url);
            const data = await res.json();
            console.log('Geoapify routing response features:', data?.features?.length);
            // Geoapify routing returns features with geometry coordinates [lon,lat]
            const coords: [number, number][] = [];
            if (data && data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
              const gcoords = data.features[0].geometry.coordinates;
              // gcoords may be LineString ([ [lon,lat], ... ]) or MultiLineString ([ [ [lon,lat], ... ], ... ])
              const pushPoint = (p: any) => { if (Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number') coords.push([p[1], p[0]]); };
              if (gcoords.length > 0 && Array.isArray(gcoords[0]) && Array.isArray(gcoords[0][0])) {
                // MultiLineString
                for (const segment of gcoords) {
                  for (const p of segment) pushPoint(p);
                }
              } else {
                // LineString
                for (const p of gcoords) pushPoint(p);
              }
            }
            if (coords.length > 0 && mapRef.current) {
              if (routeLayerRef.current) routeLayerRef.current.remove();
              routeLayerRef.current = L.polyline(coords, { color: "hsl(var(--primary))", weight: 5 }).addTo(mapRef.current);
              console.log('Geoapify polyline points:', coords.length);
            }
            return;
          } catch (e) {
            console.error('Geoapify routing error, falling back to OSRM', e);
          }
        }

        // Fallback to OSRM
        console.log('Using OSRM fallback for routing');
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        console.log('OSRM routing response:', data && data.routes && data.routes.length);
        if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            if (mapRef.current) {
                if (routeLayerRef.current) {
                    routeLayerRef.current.remove();
                }
                routeLayerRef.current = L.polyline(coords, { color: "hsl(var(--primary))", weight: 5 }).addTo(mapRef.current);
                console.log('OSRM polyline points:', coords.length);
            }
        }
    } catch(e) {
        console.error("Error fetching route", e);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
          console.warn('Map container not found');
          return;
        }

        const map = L.map('map', {
            center: defaultCenter,
            zoom: 13,
            zoomControl: false,
        });
        
        // Use Geoapify tiles - dark theme (API key from env)
        const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'ec8570c3466f4e399ff99fab00a25115';
        console.log('Loading Geoapify dark map tiles...');

        const geoapifyTileLayer = L.tileLayer(
          `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${geoapifyApiKey}`,
          {
            attribution: '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
            className: 'geoapify-tiles',
            maxZoom: 20,
            minZoom: 1,
            errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          }
        ).addTo(map);

        console.log('Geoapify tile layer added');

        geoapifyTileLayer.on('tileerror', function(error) {
          console.error('Geoapify tile loading error:', error);
        });

        mapRef.current = map;

        // Force map to recalculate size after a slight delay to ensure container is ready
        setTimeout(() => {
          map.invalidateSize();
          console.log('Map initialized and invalidated');
        }, 100);
    }
  }, []);

  // (Control UI removed) — controls were intrusive; POI category can be set programmatically now.

  // Fetch and display nearby POIs using Geoapify Places API
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'ec8570c3466f4e399ff99fab00a25115';
    const poiMarkersRef = (map as any).__poiMarkers || [] as L.Marker[];

    const clearPoiMarkers = () => {
      (poiMarkersRef as L.Marker[]).forEach(m => map.removeLayer(m));
      (map as any).__poiMarkers = [];
    };

    const fetchAndRender = async () => {
      try {
        const center = driverPosition ? L.latLng(driverPosition as any) : (pickup ? L.latLng(pickup.lat as any, pickup.lon as any) : map.getCenter());
        const lon = center.lng;
        const lat = center.lat;
        const radius = 3000; // 3km radius

        const category = (poiCategoryRef as any)?.current || null;
        const categoryParam = category ? `&categories=${encodeURIComponent(category)}` : '';
        const url = `https://api.geoapify.com/v2/places?filter=circle:${lon},${lat},${radius}&limit=30${categoryParam}&apiKey=${geoapifyApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !Array.isArray(data.features)) return;

        clearPoiMarkers();
        const newMarkers: L.Marker[] = [];

        data.features.forEach((f: any) => {
          const coords = f.geometry.coordinates;
          const props = f.properties || {};
          const m = L.marker([coords[1], coords[0]]).addTo(map);
          m.bindPopup(`<strong>${props.name || props.name_en || props.formatted || 'Place'}</strong><br/>${props.address_line1 || props.address || ''}<br/><small>Click for details</small>`);
          m.on('click', async () => {
            try {
              const id = encodeURIComponent(props.place_id);
              const detailsRes = await fetch(`https://api.geoapify.com/v2/place-details?id=${id}&apiKey=${geoapifyApiKey}`);
              const details = await detailsRes.json();
              const d = details?.features?.[0]?.properties;
              const content = `<strong>${d?.name || props.name || 'Place'}</strong><br/>${d?.formatted || props.formatted || ''}<br/>${d?.phone ? `Phone: ${d.phone}<br/>` : ''}${d?.website ? `<a href="${d.website}" target="_blank">Website</a><br/>` : ''}`;
              m.getPopup()?.setContent(content).openOn(map);
            } catch (err) {
              console.error('Error fetching place details', err);
            }
          });
          newMarkers.push(m);
        });

        (map as any).__poiMarkers = newMarkers;
      } catch (e) {
        console.error('Error fetching POIs', e);
      }
    };

    // fetch now and when driverPosition/pickup changes or when map moves
    fetchAndRender();

    const onMoveEnd = () => fetchAndRender();
    map.on('moveend', onMoveEnd);

    return () => { map.off('moveend', onMoveEnd); clearPoiMarkers(); };
  }, [driverPosition, pickup]);

  // Plan route (routeplanner) - uses a sample payload from user; logs result
  const planRoute = async () => {
    const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) return console.warn('No GEOAPIFY key for routeplanner');
    const url = `https://api.geoapify.com/v1/routeplanner?apiKey=${geoapifyApiKey}`;
    const payload = {
      mode: 'drive',
      agents: [],
      jobs: []
    };
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      console.log('Routeplanner result:', data);
      return data;
    } catch (e) {
      console.error('Routeplanner error', e);
    }
  };

  // Mapmatching sample trace
  const runMapmatchSample = async () => {
    const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) return console.warn('No GEOAPIFY key for mapmatching');
    const url = `https://api.geoapify.com/v1/mapmatching?apiKey=${geoapifyApiKey}`;
    // small sample trace (lat,lon pairs)
    const payload = { mode: 'drive', waypoints: [ { location: [10.694703,47.567028] }, { location: [10.7039882,47.5684956] } ] };
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      console.log('Mapmatching result:', data);
      if (data && data.features && data.features[0] && mapRef.current) {
        const coords = data.features[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        if (routeLayerRef.current) routeLayerRef.current.remove();
        routeLayerRef.current = L.polyline(coords, { color: 'orange', weight: 4 }).addTo(mapRef.current);
      }
    } catch (e) {
      console.error('Mapmatching error', e);
    }
  };

  // Update map view and layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers for markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    let markers: L.Marker[] = [];

    if (driverPosition) {
        markers.push(L.marker(driverPosition, { icon: driverIcon }).addTo(map).bindPopup("Driver is here"));
    }

    if (pickup) {
        markers.push(L.marker([pickup.lat, pickup.lon], { icon: pickupIcon }).addTo(map).bindPopup(`Pickup: ${pickup.display_name}`));
    }

    if (drop) {
        markers.push(L.marker([drop.lat, drop.lon], { icon: dropoffIcon }).addTo(map).bindPopup(`Drop: ${drop.display_name}`));
    }
    
    // Update view
    if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        map.setView(defaultCenter, 13);
    }
    
    // Clear and draw routes
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (driverPosition && pickup && !drop) { // Driver en-route to pickup
        getRoute(L.latLng(driverPosition), L.latLng(pickup.lat, pickup.lon));
    } else if (pickup && drop) { // User selecting route
        getRoute(L.latLng(pickup.lat, pickup.lon), L.latLng(drop.lat, drop.lon));
    }

  }, [driverPosition, pickup, drop, getRoute]);


  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 0, backgroundColor: '#1a1a1a' }} className="bg-background">
        <div id="map" style={{ height: '100%', width: '100%', backgroundColor: '#222222' }} className="z-0" />
    </div>
  );
};

export default LiveMap;
