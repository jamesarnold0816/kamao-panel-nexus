import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Product } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import uploadService from "@/services/upload";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, cartItems } = useCart();
  const { user } = useUser();
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();
  
  const isInCart = cartItems.some(item => item.product_id === product.id);
  
  const planColors = {
    free: "bg-gray-100 text-gray-800",
    basic: "bg-kamao-purple-light text-kamao-purple-dark",
    vip: "bg-purple-100 text-purple-800",
    all: "bg-green-100 text-green-800"
  };
  
  const canAccessProduct = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    switch (product.access_plan) {
      case 'free': return true;
      case 'basic': return user.plan === 'basic' || user.plan === 'vip';
      case 'vip': return user.plan === 'vip';
      case 'all': return true;
      default: return false;
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  
  const viewProductDetails = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image ? uploadService.getImageUrl(product.image) : '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
          onClick={viewProductDetails}
        />
        <Badge className={`absolute top-2 right-2 ${planColors[product.access_plan]}`}>
          {product.access_plan.charAt(0).toUpperCase() + product.access_plan.slice(1)}
        </Badge>
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute bottom-2 right-2 opacity-90 hover:opacity-100"
          onClick={viewProductDetails}
        >
          <ExternalLink className="h-4 w-4 mr-1" /> Details
        </Button>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <span className="text-lg font-bold whitespace-nowrap ml-2">{formatCurrency(product.price)}</span>
        </div>
        
        <div className="mb-2">
          <p className="text-gray-500 text-sm mb-1">Stock: {product.stock} available</p>
          <div className="bg-gray-50 p-2 rounded-md">
            <p className={`text-gray-800 text-sm ${showFullDescription ? '' : 'line-clamp-3'}`}>
              {product.description}
            </p>
            {product.description && product.description.length > 120 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 text-xs text-kamao-purple flex items-center mt-1"
                onClick={toggleDescription}
              >
                {showFullDescription ? (
                  <>Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>More <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {canAccessProduct() ? (
          isInCart ? (
            <Button variant="outline" className="w-full" disabled>
              <Check className="mr-2 h-4 w-4" /> Added to Cart
            </Button>
          ) : (
            <div className="w-full">
              <div className="flex items-center mb-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <div className="h-8 px-3 flex items-center justify-center border-y">
                  {quantity}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>
          )
        ) : (
          <Button variant="outline" className="w-full" disabled={user?.role !== 'reseller'}>
            {user?.role === 'reseller' ? 'Upgrade your plan' : 'Login to purchase'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
