
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";

const ResellerCart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, checkout, cartTotal } = useCart();
  const { user } = useUser();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  
  const handleQuantityChange = (productId: string, type: 'increase' | 'decrease') => {
    const item = cartItems.find(item => item.productId === productId);
    if (!item) return;
    
    const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
    updateQuantity(productId, newQuantity);
  };
  
  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };
  
  const handleCheckout = () => {
    checkout();
    setOrderMessage("");
    setCheckoutOpen(false);
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            Review your items before checkout
          </p>
        </div>
        
        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="h-16 w-16 overflow-hidden rounded-md">
                              <img
                                src={item.product.image || '/placeholder.svg'}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div>{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.product.category}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>₹{item.product.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => handleQuantityChange(item.productId, 'decrease')}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="h-8 px-4 flex items-center justify-center border-y">
                                {item.quantity}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => handleQuantityChange(item.productId, 'increase')}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={() => clearCart()}>
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping Fee</span>
                      <span>₹0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => {
                        if (user) {
                          setCheckoutOpen(true);
                        } else {
                          window.location.href = '/login';
                        }
                      }}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <Link to="/reseller/products" className="underline">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">Your Cart is Empty</h3>
            <p className="text-muted-foreground mb-6">
              Add products to your cart to see them here.
            </p>
            <Button asChild>
              <Link to="/reseller/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Review your order before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Order Items</h4>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableBody className="bg-muted/50">
                    <TableRow>
                      <TableCell colSpan={2} className="font-medium">Total</TableCell>
                      <TableCell className="font-bold text-right">
                        ₹{cartTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Order Message (Optional)
              </label>
              <Textarea
                id="message"
                placeholder="Add any special instructions or notes for this order"
                value={orderMessage}
                onChange={(e) => setOrderMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResellerCart;
