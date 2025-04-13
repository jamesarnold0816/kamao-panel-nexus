import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ResellerProfile = () => {
  const { user, setUser, logout } = useUser();
  const { orders, requestPlanUpgrade, planUpgradeRequests } = useCart();
  const [upgradePlanOpen, setUpgradePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'vip'>(
    (user?.plan as 'free' | 'basic' | 'vip') || 'free'
  );
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  // Filter orders for current user
  const userOrders = user 
    ? orders.filter(order => order.resellerId === user.id)
    : [];
    
  // Check if there's a pending upgrade request
  const hasPendingRequest = user && planUpgradeRequests.some(
    req => req.resellerId === user.id && req.status === 'pending'
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email
      });
      toast.success("Profile updated successfully");
    }
  };
  
  const handleRequestUpgrade = () => {
    if (user) {
      requestPlanUpgrade(
        user.id,
        user.name,
        user.email,
        (user.plan as 'free' | 'basic' | 'vip') || 'free',
        selectedPlan
      );
      setUpgradePlanOpen(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Password Change */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password for security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-500" />
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Account Type</span>
                    <Badge variant="outline">Reseller</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Current Plan</span>
                    <Badge 
                      className={
                        user?.plan === 'free' 
                          ? 'bg-gray-100 text-gray-800' 
                          : user?.plan === 'basic'
                          ? 'bg-kamao-purple-light text-kamao-purple'
                          : 'bg-purple-100 text-purple-800'
                      }
                    >
                      {user?.plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Orders</span>
                    <span className="font-medium">{userOrders.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  {hasPendingRequest && (
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        You have a pending plan upgrade request. The admin will review it shortly.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  {user?.plan !== 'vip' && !hasPendingRequest && (
                    <Button 
                      className="w-full" 
                      onClick={() => setUpgradePlanOpen(true)}
                    >
                      Request Plan Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info("Settings coming soon!")}
                >
                  Account Settings
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Support coming soon!")}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradePlanOpen} onOpenChange={setUpgradePlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Plan Upgrade</DialogTitle>
            <DialogDescription>
              Choose a plan that suits your business needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Plan</p>
              <Select
                value={selectedPlan}
                onValueChange={(value: 'free' | 'basic' | 'vip') => setSelectedPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Plan</SelectItem>
                  <SelectItem value="basic">Basic Plan (₹1,000/month)</SelectItem>
                  <SelectItem value="vip">VIP Plan (₹3,000/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Plan Features</h4>
              <div className="text-sm space-y-2">
                {selectedPlan === 'free' && (
                  <>
                    <p>• Access to basic products</p>
                    <p>• Browse product catalog</p>
                    <p className="text-gray-400">• Cannot place orders</p>
                  </>
                )}
                {selectedPlan === 'basic' && (
                  <>
                    <p>• Access to basic & premium products</p>
                    <p>• Place unlimited orders</p>
                    <p>• Priority support</p>
                  </>
                )}
                {selectedPlan === 'vip' && (
                  <>
                    <p>• Access to ALL products</p>
                    <p>• Exclusive high-profit products</p>
                    <p>• Priority fulfillment</p>
                    <p>• 24/7 dedicated support</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleRequestUpgrade}>Request Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResellerProfile;
