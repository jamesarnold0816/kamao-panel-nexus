import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import uploadService from "@/services/upload";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, cartItems } = useCart();
  const { user } = useUser();
  const [quantity, setQuantity] = useState(1);
  
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

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image ? uploadService.getImageUrl(product.image) : '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className={`absolute top-2 right-2 ${planColors[product.access_plan]}`}>
          {product.access_plan.charAt(0).toUpperCase() + product.access_plan.slice(1)}
        </Badge>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500">{product.stock} left</span>
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
