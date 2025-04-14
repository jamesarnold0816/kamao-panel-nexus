import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlanCard from "@/components/PlanCard";
import { useUser } from "@/contexts/UserContext";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Store, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ResellerDashboard = () => {
  const { user, setUser } = useUser();
  const { products } = useProducts();
  const { orders } = useCart();
  const [showUpgrade, setShowUpgrade] = useState(true);
  
  // Filter user's orders
  const userOrders = orders.filter(order => order.reseller_id === user?.id);
  
  // Get products based on user's plan
  const availableProducts = products.filter(product => {
    if (!user) return product.access_plan === 'free';
    
    switch (user.plan) {
      case 'free':
        return product.access_plan === 'free';
      case 'basic':
        return product.access_plan === 'free' || product.access_plan === 'basic';
      case 'vip':
        return true;
      default:
        return product.access_plan === 'free';
    }
  });
  
  // Select featured products
  const featuredProducts = availableProducts.slice(0, 3);

  const handleUpgradePlan = (plan: 'free' | 'basic' | 'vip') => {
    if (user) {
      setUser({ ...user, plan });
      setShowUpgrade(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome{user ? `, ${user.name}` : ' to Kamao'}
            </h1>
            <p className="text-muted-foreground">
              {user 
                ? `Your current plan: ${user.plan?.toUpperCase() || 'Free'}`
                : 'Sign up to access exclusive products and place orders'}
            </p>
          </div>
          {!user && (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Upgrade Plan Section */}
        {user && user.plan !== 'vip' && showUpgrade && (
          <div className="bg-gradient-to-r from-kamao-purple-light to-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-kamao-purple-dark">
                  Upgrade Your Plan
                </h2>
                <p className="text-sm text-gray-600">
                  Get access to more products and exclusive features
                </p>
              </div>
              <Button 
                variant="default" 
                className="bg-kamao-purple hover:bg-kamao-purple-dark"
                onClick={() => setShowUpgrade(false)}
              >
                See Plans
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Plans Section */}
        {user && !showUpgrade && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Available Plans</h2>
              <Button variant="ghost" onClick={() => setShowUpgrade(true)}>
                Hide Plans
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PlanCard
                title="Free Plan"
                subtitle="Perfect for beginners"
                price="Rs. 0"
                features={[
                  { title: "Access to basic products", included: true },
                  { title: "Browse product catalog", included: true },
                  { title: "Cannot place orders", included: false },
                ]}
                buttonText={user.plan === 'free' ? 'Current Plan' : 'Switch to Free'}
                buttonAction={() => handleUpgradePlan('free')}
              />
              <PlanCard
                title="Basic Plan"
                subtitle="For growing resellers"
                price="Rs. 1,000"
                period="month"
                features={[
                  { title: "Access to basic & premium products", included: true },
                  { title: "Place unlimited orders", included: true },
                  { title: "Priority support", included: true },
                ]}
                buttonText={user.plan === 'basic' ? 'Current Plan' : 'Upgrade to Basic'}
                buttonAction={() => handleUpgradePlan('basic')}
                popular={true}
              />
              <PlanCard
                title="VIP Plan"
                subtitle="For serious resellers"
                price="Rs. 3,000"
                period="month"
                features={[
                  { title: "Access to ALL products", included: true },
                  { title: "Exclusive high-profit products", included: true },
                  { title: "Priority fulfillment", included: true },
                  { title: "24/7 dedicated support", included: true },
                ]}
                buttonText={user.plan === 'vip' ? 'Current Plan' : 'Upgrade to VIP'}
                buttonAction={() => handleUpgradePlan('vip')}
              />
            </div>
          </div>
        )}
        
        {/* Stats and Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Available Products Card */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Products</p>
                <p className="text-3xl font-bold">{availableProducts.length}</p>
              </div>
              <div className="p-3 bg-kamao-purple-light rounded-full">
                <Store className="h-6 w-6 text-kamao-purple" />
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link to="/reseller/products" className="w-full">
                <Button variant="ghost" className="w-full rounded-t-none text-kamao-purple">
                  Browse Products
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* My Orders Card */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Orders</p>
                <p className="text-3xl font-bold">{userOrders.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link to="/reseller/orders" className="w-full">
                <Button variant="ghost" className="w-full rounded-t-none text-blue-600">
                  View Orders
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Pending Orders Card */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold">
                  {userOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link to="/reseller/orders" className="w-full">
                <Button variant="ghost" className="w-full rounded-t-none text-yellow-600">
                  Track Orders
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Cart Card */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cart Items</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link to="/reseller/cart" className="w-full">
                <Button variant="ghost" className="w-full rounded-t-none text-green-600">
                  View Cart
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Featured Products */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">₹{product.price.toLocaleString()}</span>
                    <Badge 
                      className={
                        product.access_plan === 'free'
                          ? 'bg-gray-100 text-gray-800' 
                          : product.access_plan === 'basic'
                          ? 'bg-kamao-purple-light text-kamao-purple'
                          : 'bg-purple-100 text-purple-800'
                      }
                    >
                      {product.access_plan.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link to="/reseller/products" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            
            {featuredProducts.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">No products available for your plan</p>
                  {user && user.plan !== 'vip' && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowUpgrade(false)}
                    >
                      Upgrade Your Plan
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {featuredProducts.length > 0 && (
            <div className="flex justify-center mt-4">
              <Link to="/reseller/products">
                <Button variant="outline">View All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellerDashboard;
