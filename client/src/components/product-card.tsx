import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

// Using the same Product interface as in marketplace.tsx
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  seller: string;
  location: string;
  imageUrl?: string;
  priceChange?: number;
  createdAt: Date;
  updatedAt: Date;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Function to format price change
  const formatPriceChange = () => {
    if (!product.priceChange) return null;
    
    const isPositive = product.priceChange > 0;
    const isUnchanged = product.priceChange === 0;
    
    let icon = isPositive ? "fa-arrow-up" : isUnchanged ? "fa-equals" : "fa-arrow-down";
    let colorClass = isPositive ? "text-status-success" : isUnchanged ? "text-neutral-500" : "text-status-error";
    let text = isUnchanged ? "Unchanged" : `${Math.abs(product.priceChange)}% from last week`;
    
    return (
      <div className={`text-sm ${colorClass}`}>
        <i className={`fas ${icon} mr-1`}></i>
        <span>{text}</span>
      </div>
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <div className="product-card bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-md transition duration-300">
        <div className="h-40 overflow-hidden">
          <img 
            src={product.imageUrl || "https://via.placeholder.com/400x250?text=Product+Image"} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-heading font-bold text-lg mb-1">{product.name}</h3>
          <div className="flex items-center text-sm text-neutral-500 mb-3">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{product.seller}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-lg">
              ₹{product.price}<span className="text-sm text-neutral-500">/{product.unit}</span>
            </div>
            {formatPriceChange()}
          </div>
          <div className="flex justify-between">
            <Badge variant="outline" className="bg-primary-50 text-primary-600 px-2 py-1 rounded-full text-xs border-0">
              {product.category}
            </Badge>
            <Button 
              variant="ghost" 
              className="text-primary-500 hover:text-primary-600 text-sm font-medium cursor-pointer"
              onClick={() => setDetailsOpen(true)}
            >
              View Details <i className="fas fa-chevron-right ml-1"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm">
              <span className="font-medium">{product.category}</span>
              <span className="text-neutral-400">•</span>
              <span>{product.seller}</span>
              <span className="text-neutral-400">•</span>
              <span>{product.location}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <img 
                src={product.imageUrl || "https://via.placeholder.com/400x300?text=Product+Image"} 
                alt={product.name} 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Description</h4>
                <p>{product.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Price Information</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">₹{product.price}</span>
                  <span className="text-sm text-neutral-500">per {product.unit}</span>
                </div>
                {product.priceChange && (
                  <div className="mt-1">{formatPriceChange()}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Listed On</h4>
                  <p>{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Last Updated</h4>
                  <p>{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              className="bg-primary hover:bg-primary/90 cursor-pointer"
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
