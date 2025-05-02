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

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  seller: z.string().min(3, "Seller name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  priceChange: z.coerce.number().optional()
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "kg",
      category: "",
      seller: "",
      location: "",
      imageUrl: "",
      priceChange: 0
    }
  });

  const registerProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Registered",
        description: "Your product has been successfully registered"
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register product. Please try again.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(values: ProductFormValues) {
    registerProductMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Price" 
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
              <FormItem className="w-1/3">
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
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Where is the product from" {...field} />
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
          name="priceChange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Change % (compared to last week)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 5 for 5% increase, -3 for 3% decrease" 
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

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={registerProductMutation.isPending}
        >
          {registerProductMutation.isPending ? "Registering..." : "Register Product"}
        </Button>
      </form>
    </Form>
  );
}
