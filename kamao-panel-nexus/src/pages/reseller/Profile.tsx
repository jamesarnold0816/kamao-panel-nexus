import { useState, useRef } from "react";
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
import { User, Camera, Upload } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import uploadService from "@/services/upload";

const ResellerProfile = () => {
  const { user, setUser, logout, updateAvatar } = useUser();
  const { orders, requestPlanUpgrade, planUpgradeRequests } = useCart();
  const [upgradePlanOpen, setUpgradePlanOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'vip'>(
    (user?.plan as 'free' | 'basic' | 'vip') || 'free'
  );
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    ? orders.filter(order => order.reseller_id === user.id)
    : [];
    
  // Check if there's a pending upgrade request
  const hasPendingRequest = user && planUpgradeRequests.some(
    req => req.reseller_id === user.id && req.status === 'pending'
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      // Only update name and email, not plan
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
        (user.plan as 'free' | 'basic' | 'vip') || 'free',
        selectedPlan
      );
      setUpgradePlanOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Start progress animation for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) { // Only go up to 90% until actual upload completes
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);
      
      // Use the upload service to upload the file to the server
      const uploadResponse = await uploadService.uploadFile(avatarFile, 'avatar');
      
      // Upload complete, set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update user with new avatar via UserContext
      const success = await updateAvatar(uploadResponse.url);
      
      if (success) {
        setAvatarDialogOpen(false);
        toast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setAvatarFile(null);
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
                <div className="flex items-center justify-center mb-6 relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-kamao-purple">
                    {user?.avatar ? (
                      <img 
                        src={uploadService.getImageUrl(user.avatar)}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        key={`avatar-${user?.id}`}
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 p-1.5 bg-kamao-purple text-white rounded-full shadow-md hover:bg-purple-700 transition-colors"
                    onClick={() => setAvatarDialogOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
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

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Choose an image to set as your profile picture
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-32 w-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                {avatarFile ? (
                  <img 
                    src={URL.createObjectURL(avatarFile)} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">No file selected</span>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Choose Image
              </Button>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setAvatarDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAvatarUpload} 
              disabled={!avatarFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResellerProfile;
