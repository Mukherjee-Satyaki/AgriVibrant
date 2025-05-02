import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const auctionFormSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startingBid: z.coerce.number().positive("Starting bid must be positive"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  seller: z.string().min(3, "Seller name must be at least 3 characters"),
  duration: z.coerce.number().positive("Duration must be positive").int("Duration must be a whole number"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  scheduledStart: z.coerce.date().optional()
});

type AuctionFormValues = z.infer<typeof auctionFormSchema>;

export default function AuctionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionFormSchema),
    defaultValues: {
      productName: "",
      description: "",
      startingBid: 0,
      quantity: 0,
      unit: "kg",
      category: "",
      seller: "",
      duration: 24, // Default 24 hours
      imageUrl: ""
    }
  });

  const createAuctionMutation = useMutation({
    mutationFn: async (values: AuctionFormValues) => {
      const response = await apiRequest("POST", "/api/auctions", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Auction Created",
        description: "Your auction has been successfully created"
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/auctions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create auction. Please try again.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(values: AuctionFormValues) {
    createAuctionMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startingBid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Bid (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Starting bid" 
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

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Auction duration" 
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Quantity" 
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

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="unit">Unit/Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fruits_vegetables">Fruits & Vegetables</SelectItem>
                  <SelectItem value="grains_pulses">Grains & Pulses</SelectItem>
                  <SelectItem value="dairy">Dairy Products</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seller"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller/Farm Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name or farm name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="URL to product image" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scheduledStart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Start Date (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''} 
                  onChange={(e) => {
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                  }}
                />
              </FormControl>
              <div className="text-xs text-neutral-500">Leave empty to start the auction immediately</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#FF9800] hover:bg-amber-600"
          disabled={createAuctionMutation.isPending}
        >
          {createAuctionMutation.isPending ? "Creating Auction..." : "Create Auction"}
        </Button>
      </form>
    </Form>
  );
}
