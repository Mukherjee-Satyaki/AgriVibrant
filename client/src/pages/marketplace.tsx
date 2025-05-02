import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import ProductForm from "@/components/product-form";
// Using the ProductResponse type from server
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

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const productsPerPage = 8;
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', category !== 'all' ? category : null, sortOrder],
  });

  const filteredProducts = products.filter(
    product => product.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Get paginated products
  const paginatedProducts = filteredProducts.slice(0, page * productsPerPage);
  
  // Check if there are more products to load
  const loadMoreProducts = () => {
    const nextPage = page + 1;
    if (nextPage * productsPerPage >= filteredProducts.length) {
      setHasMore(false);
    }
    setPage(nextPage);
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Agricultural Marketplace</h2>
            <p className="text-neutral-700 max-w-2xl">Register and browse market values of various agricultural products. Stay updated with current prices and trends.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="px-5 py-2 bg-primary hover:bg-primary/90">
                  <i className="fas fa-plus-circle mr-2"></i>Register New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Register New Product</DialogTitle>
                </DialogHeader>
                <ProductForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">No products found. Try adjusting your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Only show load more button if there are more products to load */}
        {filteredProducts.length > paginatedProducts.length && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              className="px-6 py-3 border-primary text-primary hover:bg-primary/10 cursor-pointer"
              onClick={loadMoreProducts}
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
