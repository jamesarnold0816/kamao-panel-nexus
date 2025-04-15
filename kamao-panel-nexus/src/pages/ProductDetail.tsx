import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { productService } from "@/services/api";
import uploadService from "@/services/upload";
import { formatCurrency } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ShoppingCart, 
  Check, 
  ChevronRight, 
  Images,
  Tag,
  Package,
  Shield
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { user } = useUser();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const isInCart = cartItems.some(item => item.product_id === id);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if we already have the product in our context
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct) {
          setProduct(existingProduct);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch it from the API
        const productData = await productService.getProductById(id as string);
        setProduct(productData);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, products]);
  
  const planColors = {
    free: "bg-gray-100 text-gray-800",
    basic: "bg-kamao-purple-light text-kamao-purple-dark",
    vip: "bg-purple-100 text-purple-800",
    all: "bg-green-100 text-green-800"
  };
  
  const canAccessProduct = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    switch (product?.access_plan) {
      case 'free': return true;
      case 'basic': return user.plan === 'basic' || user.plan === 'vip';
      case 'vip': return user.plan === 'vip';
      case 'all': return true;
      default: return false;
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  const handleNavigateImage = (direction: 'prev' | 'next') => {
    if (!product) return;
    
    const allImages = [product.image, ...(product.secondary_images || [])];
    
    if (direction === 'prev') {
      setActiveImageIndex((prevIndex) => 
        prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
      );
    } else {
      setActiveImageIndex((prevIndex) => 
        prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-kamao-purple rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error || "Product not found"}</p>
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  const allImages = [product.image, ...(product.secondary_images || [])];
  const activeImage = allImages[activeImageIndex];
  
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden border">
            <img 
              src={activeImage ? uploadService.getImageUrl(activeImage) : '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-contain"
            />
            
            {allImages.length > 1 && (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => handleNavigateImage('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => handleNavigateImage('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Badge className={`absolute top-2 right-2 ${planColors[product.access_plan]}`}>
              {product.access_plan.charAt(0).toUpperCase() + product.access_plan.slice(1)}
            </Badge>
          </div>
          
          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  className={`relative w-16 h-16 flex-shrink-0 border rounded cursor-pointer overflow-hidden ${
                    activeImageIndex === index ? 'ring-2 ring-kamao-purple' : ''
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img 
                    src={img ? uploadService.getImageUrl(img) : '/placeholder.svg'} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="mr-2">
                <Tag className="h-3 w-3 mr-1" /> {product.category}
              </Badge>
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" /> {product.stock} in stock
              </Badge>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-kamao-purple">
            {formatCurrency(product.price)}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <div className="prose">
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          </div>
          
          <Separator />
          
          {canAccessProduct() ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">
                        Available with your {user?.plan || ''} plan
                      </span>
                    </div>
                  </div>
                  
                  {!isInCart ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-r-none"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <div className="h-10 px-6 flex items-center justify-center border-y">
                          {quantity}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-l-none"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        >
                          +
                        </Button>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={product.stock < 1}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" /> 
                        {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" size="lg" disabled>
                      <Check className="mr-2 h-5 w-5" /> Added to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    This product requires {product.access_plan} plan or higher.
                  </p>
                  {user?.role === 'reseller' ? (
                    <Button>Upgrade Your Plan</Button>
                  ) : (
                    <Button onClick={() => navigate('/login')}>Login to Purchase</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 