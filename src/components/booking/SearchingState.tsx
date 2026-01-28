import { Car, X } from 'lucide-react';
import { Button } from '../ui/button';

const SearchingState = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 h-64">
      <div className="relative">
        <Car className="h-20 w-20 text-primary animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping"></div>
      </div>
      <h3 className="text-xl font-semibold font-headline">
        Searching for a driver...
      </h3>
      <p className="text-muted-foreground">Please wait while we find the best match for you.</p>

      <Button
        variant="destructive"
        className="w-full"
        onClick={onCancel}
      >
        <X className="mr-2 h-4 w-4" /> Cancel Ride
      </Button>
    </div>
  );
};

export default SearchingState;
