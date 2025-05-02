import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UpcomingAuction } from "@shared/schema";

interface UpcomingAuctionsTableProps {
  auctions: UpcomingAuction[];
}

export default function UpcomingAuctionsTable({ auctions }: UpcomingAuctionsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setReminderMutation = useMutation({
    mutationFn: async (auctionId: number) => {
      const response = await apiRequest(
        "POST", 
        `/api/auctions/${auctionId}/reminder`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Set",
        description: "You will be notified when this auction starts."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auctions/upcoming'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set reminder. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSetReminder = (auctionId: number) => {
    setReminderMutation.mutate(auctionId);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-md overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="font-heading font-semibold">Product</TableHead>
            <TableHead className="font-heading font-semibold">Seller</TableHead>
            <TableHead className="font-heading font-semibold">Starting Price</TableHead>
            <TableHead className="font-heading font-semibold">Quantity</TableHead>
            <TableHead className="font-heading font-semibold">Starts In</TableHead>
            <TableHead className="font-heading font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auctions.map((auction) => (
            <TableRow key={auction.id} className="hover:bg-neutral-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100">
                    <img 
                      src={auction.imageUrl || "https://via.placeholder.com/40?text=Product"} 
                      alt={auction.productName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="font-medium">{auction.productName}</span>
                </div>
              </TableCell>
              <TableCell>{auction.seller}</TableCell>
              <TableCell className="font-medium">₹{auction.startingBid}</TableCell>
              <TableCell>{auction.quantity} {auction.unit}</TableCell>
              <TableCell className="text-primary-500">{auction.startsIn}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm rounded border border-neutral-200 transition"
                  onClick={() => handleSetReminder(auction.id)}
                  disabled={setReminderMutation.isPending}
                >
                  {setReminderMutation.isPending ? "Setting..." : "Set Reminder"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
