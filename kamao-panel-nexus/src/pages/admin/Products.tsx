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
import FileUpload from "@/components/ui/file-upload";
import MultiFileUpload from "@/components/ui/multi-file-upload";
import { toast } from "sonner";
import uploadService from "@/services/upload";

const formSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  access_plan: z.enum(['free', 'basic', 'vip', 'all'] as const),
  stock: z.coerce.number().min(0, { message: "Stock cannot be negative." }),
  image: z.string().optional(),
  secondary_images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
      access_plan: 'free',
      stock: 0,
      image: '',
      secondary_images: [],
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
      setProductImage(null);
      setSecondaryImages([]);
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
      access_plan: product.access_plan,
      stock: product.stock,
      image: product.image,
      secondary_images: product.secondary_images || [],
    });
    setOpen(true);
  };
  
  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      let imageUrl = values.image || '';
      let secondaryImageUrls: string[] = [];
      
      // Upload main image if a new one is selected
      if (productImage) {
        try {
          const uploadResponse = await uploadService.uploadFile(productImage, 'product');
          imageUrl = uploadResponse.url;
        } catch (error) {
          console.error("Main image upload error:", error);
          toast.error("Failed to upload main image");
          setIsUploading(false);
          return;
        }
      }
      
      // Upload secondary images if any are selected
      if (secondaryImages.length > 0) {
        try {
          const uploadPromises = secondaryImages.map(file => 
            uploadService.uploadFile(file, 'product')
          );
          
          const uploadResults = await Promise.all(uploadPromises);
          secondaryImageUrls = uploadResults.map(result => result.url);
        } catch (error) {
          console.error("Secondary images upload error:", error);
          toast.error("Failed to upload some secondary images");
          // Continue with the ones that did upload
        }
      } else if (selectedProduct?.secondary_images) {
        // Keep existing secondary images if not changed
        secondaryImageUrls = selectedProduct.secondary_images;
      }
      
      const finalCategory = showCategoryInput && newCategory ? newCategory : values.category;
      
      if (isEditing && selectedProduct) {
        updateProduct(selectedProduct.id, {
          ...values,
          category: finalCategory,
          image: imageUrl,
          secondary_images: secondaryImageUrls,
        });
      } else {
        addProduct({
          name: values.name,
          price: values.price,
          description: values.description,
          category: finalCategory,
          access_plan: values.access_plan,
          stock: values.stock,
          image: imageUrl || getPlaceholderImage(values.name),
          secondary_images: secondaryImageUrls,
        });
      }
      
      setIsUploading(false);
      setOpen(false);
      toast.success(isEditing ? "Product updated successfully" : "Product added successfully");
    } catch (error) {
      setIsUploading(false);
      console.error("Error submitting product:", error);
      toast.error("Failed to save product");
    }
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
                      <FormLabel>Price (Rs)</FormLabel>
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
                  name="access_plan"
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
                          <SelectItem value="basic">Basic Plan</SelectItem>
                          <SelectItem value="vip">VIP Plan</SelectItem>
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
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <FileUpload
                        onFileChange={setProductImage}
                        currentImage={field.value}
                        accept="image/*"
                        buttonText="Upload Product Image"
                        maxSizeMB={5}
                        previewHeight="h-40"
                        previewWidth="w-40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondary_images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Images</FormLabel>
                    <FormControl>
                      <MultiFileUpload
                        onFilesChange={(files) => {
                          if (files.length > 0) {
                            setSecondaryImages(files);
                            field.onChange(files.map(file => file.name));
                          }
                        }}
                        currentImages={selectedProduct?.secondary_images || []}
                        accept="image/*"
                        buttonText="Upload Secondary Images"
                        maxSizeMB={5}
                        previewHeight="h-24"
                        previewWidth="w-24"
                        maxFiles={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : isEditing ? "Update Product" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
