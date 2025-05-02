import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Using the AuctionResponse type from storage.ts
interface Auction {
  id: string;
  productName: string;
  description: string;
  startingBid: number;
  currentBid: number;
  quantity: number;
  unit: string;
  category: string;
  seller: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'scheduled' | 'completed';
  bidCount: number;
  createdAt: Date;
  remainingTime: number;
}

// Representing a bid from API
interface Bid {
  id: string;
  auctionId: string;
  userId?: string;
  bidderName: string;
  amount: number;
  createdAt: Date;
}

// BidHistory component to display recent bids
function BidHistory({ auctionId }: { auctionId: string }) {
  const { data: bids, isLoading, error } = useQuery<Bid[]>({
    queryKey: ['/api/auctions', auctionId, 'bids'],
    queryFn: async () => {
      const response = await fetch(`/api/auctions/${auctionId}/bids`);
      if (!response.ok) {
        throw new Error('Failed to fetch bid history');
      }
      return await response.json();
    }
  });

  // Format date for display
  const formatBidDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading bid history...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Failed to load bid history</div>;
  }

  if (!bids || bids.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No bids placed yet</div>;
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-2 py-1 text-left font-medium">Bidder</th>
            <th className="px-2 py-1 text-right font-medium">Amount</th>
            <th className="px-2 py-1 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.id} className="border-t border-neutral-100">
              <td className="px-2 py-1">{bid.bidderName}</td>
              <td className="px-2 py-1 text-right font-semibold">₹{bid.amount}</td>
              <td className="px-2 py-1 text-right text-neutral-500">{formatBidDate(bid.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AuctionCardProps {
  auction: Auction;
}

const bidFormSchema = z.object({
  amount: z.coerce.number()
    .positive("Bid amount must be positive")
    .min(1, "Bid amount is required")
});

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof bidFormSchema>>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      amount: auction.currentBid + 100  // Default to current bid + 100
    }
  });

  const placeBidMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bidFormSchema>) => {
      const response = await apiRequest(
        "POST", 
        `/api/auctions/${auction.id}/bid`, 
        { amount: data.amount }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid Placed",
        description: "Your bid has been placed successfully!"
      });
      setIsDialogOpen(false);
      // Invalidate queries to refresh auction data
      queryClient.invalidateQueries({ queryKey: ['/api/auctions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof bidFormSchema>) => {
    if (data.amount <= auction.currentBid) {
      form.setError("amount", { 
        message: `Bid must be higher than current bid (₹${auction.currentBid})` 
      });
      return;
    }
    placeBidMutation.mutate(data);
  };

  // Calculate time remaining
  const formatTimeRemaining = () => {
    const hours = Math.floor(auction.remainingTime / 60);
    const minutes = auction.remainingTime % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={auction.imageUrl || "https://via.placeholder.com/400x250?text=Auction+Image"} 
          alt={auction.productName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          <i className="fas fa-stopwatch mr-1"></i> Ends in {formatTimeRemaining()}
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-heading font-bold text-lg mb-1">{auction.productName}</h4>
        <div className="flex items-center text-sm text-neutral-500 mb-4">
          <i className="fas fa-user mr-1"></i>
          <span>Listed by {auction.seller}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-neutral-500">Current Bid</div>
            <div className="font-semibold text-lg">₹{auction.currentBid}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Starting Bid</div>
            <div className="font-semibold text-lg">₹{auction.startingBid}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Bids</div>
            <div className="font-semibold text-lg">{auction.bidCount}</div>
          </div>
        </div>
        
        <Tabs defaultValue="place-bid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="place-bid">Place Bid</TabsTrigger>
            <TabsTrigger value="bid-history">Bid History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="place-bid">
            <Button
              className="w-full py-2 bg-[#FF9800] hover:bg-amber-600 text-white transition"
              onClick={() => setIsDialogOpen(true)}
            >
              Place Bid
            </Button>
          </TabsContent>
          
          <TabsContent value="bid-history">
            <div className="p-3">
              <BidHistory auctionId={auction.id} />
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place a Bid on {auction.productName}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bid Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your bid" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? "0" : e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-neutral-500">
                  <p>Current highest bid: ₹{auction.currentBid}</p>
                  <p>Your bid must be higher than the current bid.</p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#FF9800] hover:bg-amber-600">
                    {placeBidMutation.isPending ? "Placing Bid..." : "Confirm Bid"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
