import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import { uploadService } from "@/services/upload";
import { adminService } from "@/services/api";
import { toast } from "sonner";

const AdminSettings = () => {
  const [logoUrl, setLogoUrl] = useState("/placeholder.svg");
  const [companyName, setCompanyName] = useState("Kamao");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [autoApproveResellers, setAutoApproveResellers] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load company settings on component mount
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        setIsLoading(true);
        const settings = await adminService.getCompanySettings();
        if (settings) {
          setCompanyName(settings.name || 'Kamao');
          setLogoUrl(settings.logoUrl || '/placeholder.svg');
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
        // Use fallback values if API connection fails
        setCompanyName('Kamao');
        setLogoUrl('/placeholder.svg');
        
        // Show a more user-friendly error message
        toast.error('Could not load settings from server. Using default values.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanySettings();
  }, []);

  // Function to handle logo file changes
  const handleLogoFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }
    
    setIsLogoUploading(true);
    
    try {
      // Upload the logo file
      const uploadResponse = await uploadService.uploadFile(file, 'product');
      
      // Update the logo URL state
      setLogoUrl(uploadResponse.url);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Logo upload error:", error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('Network Error')) {
        toast.error("Network error: Cannot connect to upload server. Please check your connection.");
        
        // Create a temporary object URL for the logo if we're in development
        if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
          const tempUrl = URL.createObjectURL(file);
          setLogoUrl(tempUrl);
          toast.info("Using temporary local URL for preview purposes");
        }
      } else {
        toast.error("Failed to upload logo");
      }
    } finally {
      setIsLogoUploading(false);
    }
  };

  // Function to save company information
  const saveCompanyInfo = async () => {
    setIsSaving(true);
    
    try {
      // Call the API to save the settings
      await adminService.updateCompanySettings({ 
        name: companyName, 
        logoUrl 
      });
      
      toast.success("Company information saved successfully");
    } catch (error) {
      console.error("Error saving company info:", error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('Network Error')) {
        toast.error("Network error: Cannot connect to server. Please check your connection.");
      } else {
        toast.error("Failed to save company information");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="reseller">Reseller Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo</Label>
                <FileUpload
                  onFileChange={handleLogoFileChange}
                  currentImage={logoUrl}
                  buttonText="Upload Logo"
                  previewHeight="h-32"
                  previewWidth="max-w-xs"
                  maxSizeMB={2}
                />
              </div>
              {isLogoUploading && (
                <p className="text-sm text-muted-foreground">Uploading logo...</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveCompanyInfo} disabled={isSaving || isLogoUploading}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>
                Set your contact information for resellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="contact@kamao.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  placeholder="123 Main Street, City, State, Country"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you'll receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">All Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email for all system notifications
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-notifications">New Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new order is placed
                  </p>
                </div>
                <Switch
                  id="order-notifications"
                  checked={orderNotifications}
                  onCheckedChange={setOrderNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reseller-notifications">New Reseller Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new reseller signs up
                  </p>
                </div>
                <Switch
                  id="reseller-notifications"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reseller" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reseller Approval</CardTitle>
              <CardDescription>
                Configure how new resellers are approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approve">Auto-approve New Resellers</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve all new reseller registrations
                  </p>
                </div>
                <Switch
                  id="auto-approve"
                  checked={autoApproveResellers}
                  onCheckedChange={setAutoApproveResellers}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-verification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification before reseller approval
                  </p>
                </div>
                <Switch
                  id="require-verification"
                  defaultChecked
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plan Settings</CardTitle>
              <CardDescription>
                Configure reseller plans and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Plan settings can be configured from the dedicated Plans page.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Go to Plans</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure how you accept payments from resellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Accept Credit Cards</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow payments via credit and debit cards
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Accept Bank Transfers</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow payments via bank transfers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Accept UPI</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow payments via UPI
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Payment Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
