
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Ship, Plane, Info } from "lucide-react";
import { SHIPPING_DISCLAIMER } from "@/utils/cbm";

interface ShippingModeSelectorProps {
  selectedMode: 'sea' | 'air';
  onModeChange: (mode: 'sea' | 'air') => void;
  selectedDestination?: string;
  onDestinationChange?: (destination: string) => void;
  showDestination?: boolean;
}

const destinations = [
  { id: 'lagos', name: 'Lagos', rate: '₦450,000/CBM' },
  { id: 'aba_port_harcourt', name: 'Aba / Port Harcourt', rate: '₦465,000/CBM' },
  { id: 'onitsha', name: 'Onitsha', rate: '₦475,000/CBM' },
];

export const ShippingModeSelector: React.FC<ShippingModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  selectedDestination,
  onDestinationChange,
  showDestination = true,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Shipping Mode</Label>
        <RadioGroup
          value={selectedMode}
          onValueChange={(value) => onModeChange(value as 'sea' | 'air')}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="sea"
              id="sea"
              className="peer sr-only"
            />
            <Label
              htmlFor="sea"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
            >
              <div className="flex w-full justify-between items-start mb-2">
                <Ship className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Recommended
                </Badge>
              </div>
              <div className="w-full">
                <div className="font-bold text-lg">Sea Shipping</div>
                <div className="text-sm text-muted-foreground mt-1">
                  60 ±days transit. Most cost-effective for large items.
                </div>
                <div className="text-xs font-medium text-primary mt-2">
                  Clearing inclusive
                </div>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="air"
              id="air"
              className="peer sr-only"
            />
            <Label
              htmlFor="air"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
            >
              <div className="flex w-full justify-between items-start mb-2">
                <Plane className="h-6 w-6 text-blue-500" />
              </div>
              <div className="w-full">
                <div className="font-bold text-lg">Air Shipping</div>
                <div className="text-sm text-muted-foreground mt-1">
                  5–10 days transit. Fast delivery for urgent orders.
                </div>
                <div className="text-xs font-medium text-blue-500 mt-2">
                  Rate calculated at checkout (per kg)
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedMode === 'sea' && showDestination && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Destination</Label>
          <RadioGroup
            value={selectedDestination}
            onValueChange={onDestinationChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {destinations.map((dest) => (
              <div key={dest.id}>
                <RadioGroupItem
                  value={dest.id}
                  id={dest.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={dest.id}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full"
                >
                  <div className="font-bold">{dest.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{dest.rate}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed italic">
            {SHIPPING_DISCLAIMER}
          </p>
        </div>
      </Card>
    </div>
  );
};
