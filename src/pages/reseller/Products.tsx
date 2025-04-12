
import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const ResellerProducts = () => {
  const { products, filteredProducts, categories } = useProducts();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [displayProducts, setDisplayProducts] = useState(products);
  
  // Update displayed products when filters change
  useEffect(() => {
    const userPlan = user?.plan || 'free';
    setDisplayProducts(filteredProducts(selectedCategory, searchQuery, userPlan));
  }, [searchQuery, selectedCategory, products, user?.plan, filteredProducts]);
  
  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Browse and purchase products for your business
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant={selectedCategory ? "outline" : "default"} 
            onClick={() => setSelectedCategory(undefined)}
          >
            All Categories
          </Button>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedCategory(
                selectedCategory === category ? undefined : category
              )}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-muted-foreground text-lg">
                No products found matching your criteria.
              </p>
              {user?.plan !== 'vip' && (
                <p className="mt-2">
                  Consider upgrading your plan to access more products.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellerProducts;
