'use client';

import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Car } from 'lucide-react';

const MapPlaceholder = () => {
  const mapImage = getPlaceholderImage('map-background');

  if (!mapImage) {
    return (
      <div className="absolute inset-0 bg-card" />
    );
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={mapImage.imageUrl}
        alt={mapImage.description}
        fill
        sizes="100vw"
        className="object-cover"
        data-ai-hint={mapImage.imageHint}
        priority
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Mock car icons */}
      <div className="absolute top-[30%] left-[40%] text-primary transform -translate-x-1/2 -translate-y-1/2">
        <Car className="w-8 h-8 opacity-80 neon-primary" />
      </div>
      <div className="absolute top-[50%] left-[60%] text-primary transform -translate-x-1/2 -translate-y-1/2">
        <Car className="w-8 h-8 opacity-60 neon-primary" />
      </div>
      <div className="absolute top-[60%] left-[30%] text-primary transform -translate-x-1/2 -translate-y-1/2">
        <Car className="w-8 h-8 opacity-70 neon-primary" />
      </div>
       <div className="absolute top-[25%] left-[75%] text-primary transform -translate-x-1/2 -translate-y-1/2">
        <Car className="w-8 h-8 opacity-50 neon-primary" />
      </div>
    </div>
  );
};

export default MapPlaceholder;
