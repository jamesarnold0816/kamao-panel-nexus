
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProducts, Product, AccessPlan } from "@/contexts/ProductContext";
import ProductTable from "@/components/ProductTable";
import { getPlaceholderImage } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  accessPlan: z.enum(['free', 'basic', 'vip', 'all'] as const),
  stock: z.coerce.number().min(0, { message: "Stock cannot be negative." }),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
      accessPlan: 'free',
      stock: 0,
      image: '/placeholder.svg',
    },
  });
  
  const onOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      form.reset();
      setShowCategoryInput(false);
      setNewCategory('');
      setSelectedProduct(null);
      setIsEditing(false);
    }
    setOpen(open);
  };
  
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    form.reset({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      accessPlan: product.accessPlan,
      stock: product.stock,
      image: product.image,
    });
    setOpen(true);
  };
  
  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };
  
  const onSubmit = (values: FormValues) => {
    if (isEditing && selectedProduct) {
      updateProduct(selectedProduct.id, values);
    } else {
      const finalCategory = showCategoryInput && newCategory ? newCategory : values.category;
      addProduct({
        ...values,
        category: finalCategory,
        image: values.image || getPlaceholderImage(values.name),
      });
    }
    setOpen(false);
  };
  
  const handleAddCategory = () => {
    if (newCategory) {
      form.setValue('category', newCategory);
      setShowCategoryInput(false);
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {/* Products Table */}
      <ProductTable 
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edit the product details below.'
                : 'Fill out the form below to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Smartphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a detailed description of your product..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      {showCategoryInput ? (
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="New Category"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                            />
                          </FormControl>
                          <Button type="button" size="sm" onClick={handleAddCategory}>
                            Add
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCategoryInput(true)}
                          >
                            New
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accessPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Plan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="all">All Plans</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
