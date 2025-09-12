/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  onSuccess?: () => void;
  editData?: any;
}

export function BookingForm({ onSuccess, editData }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: editData ? "Booking Updated" : "Booking Created",
      description: "The booking has been successfully saved.",
    });
    
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" defaultValue={editData?.firstName} required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" defaultValue={editData?.lastName} required />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={editData?.email} required />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" defaultValue={editData?.phone} required />
      </div>
      
      <div>
        <Label htmlFor="roomType">Room Type</Label>
        <Select defaultValue={editData?.roomType}>
          <SelectTrigger>
            <SelectValue placeholder="Select room type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Room</SelectItem>
            <SelectItem value="deluxe">Deluxe Suite</SelectItem>
            <SelectItem value="premium">Premium Suite</SelectItem>
            <SelectItem value="presidential">Presidential Suite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label>Check-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="guests">Number of Guests</Label>
        <Select defaultValue={editData?.guests || "2"}>
          <SelectTrigger>
            <SelectValue placeholder="Select guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Guest</SelectItem>
            <SelectItem value="2">2 Guests</SelectItem>
            <SelectItem value="3">3 Guests</SelectItem>
            <SelectItem value="4">4 Guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea 
          id="specialRequests" 
          placeholder="Any special requirements or requests..."
          defaultValue={editData?.specialRequests}
        />
      </div>

      <Button type="submit" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {editData ? "Update Booking" : "Create Booking"}
      </Button>
    </form>
  );
}