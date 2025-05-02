import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuctionCard from "@/components/auction-card";
import AuctionForm from "@/components/auction-form";
import UpcomingAuctionsTable from "@/components/upcoming-auctions-table";
import { Auction, UpcomingAuction } from "@shared/schema";

export default function BiddingPage() {
  const [category, setCategory] = useState("all");
  
  const { data: auctions = [], isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions', category !== 'all' ? category : null],
  });
  
  const { data: upcomingAuctions = [], isLoading: upcomingLoading } = useQuery<UpcomingAuction[]>({
    queryKey: ['/api/auctions/upcoming'],
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Digital Agricultural Auctions</h2>
            <p className="text-neutral-700 max-w-2xl">Participate in live bidding for premium agricultural products or list your own products for auction.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="px-5 py-2 bg-[#FF9800] hover:bg-amber-600 text-white">
                  <i className="fas fa-hammer mr-2"></i>Create Auction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Auction</DialogTitle>
                </DialogHeader>
                <AuctionForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Auction Categories */}
        <div className="flex overflow-x-auto py-2 mb-8 gap-4 no-scrollbar">
          <Button 
            onClick={() => setCategory("all")}
            className={`whitespace-nowrap rounded-full ${category === "all" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            All Auctions
          </Button>
          <Button 
            onClick={() => setCategory("ending_soon")}
            className={`whitespace-nowrap rounded-full ${category === "ending_soon" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Ending Soon
          </Button>
          <Button 
            onClick={() => setCategory("fruits_vegetables")}
            className={`whitespace-nowrap rounded-full ${category === "fruits_vegetables" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Fruits & Vegetables
          </Button>
          <Button 
            onClick={() => setCategory("grains_pulses")}
            className={`whitespace-nowrap rounded-full ${category === "grains_pulses" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Grains & Pulses
          </Button>
          <Button 
            onClick={() => setCategory("dairy")}
            className={`whitespace-nowrap rounded-full ${category === "dairy" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Dairy Products
          </Button>
          <Button 
            onClick={() => setCategory("spices")}
            className={`whitespace-nowrap rounded-full ${category === "spices" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Spices
          </Button>
          <Button 
            onClick={() => setCategory("organic")}
            className={`whitespace-nowrap rounded-full ${category === "organic" ? 'bg-[#FF9800] hover:bg-amber-600 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            Organic
          </Button>
        </div>

        {/* Live Auctions */}
        <h3 className="font-heading font-semibold text-xl mb-6">Live Auctions</h3>
        {auctionsLoading ? (
          <div className="text-center py-8">Loading auctions...</div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-8">No active auctions found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}

        {/* Upcoming Auctions */}
        <h3 className="font-heading font-semibold text-xl mb-6">Upcoming Auctions</h3>
        {upcomingLoading ? (
          <div className="text-center py-8">Loading upcoming auctions...</div>
        ) : upcomingAuctions.length === 0 ? (
          <div className="text-center py-8">No upcoming auctions found.</div>
        ) : (
          <UpcomingAuctionsTable auctions={upcomingAuctions} />
        )}
      </div>
    </section>
  );
}
