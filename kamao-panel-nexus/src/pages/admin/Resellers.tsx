import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Upload, 
  Download, 
  MoreHorizontal, 
  UserIcon,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useUser, User } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { Spinner } from "@/components/ui/spinner";
import { userService } from "@/services/api";

const AdminResellers = () => {
  const { orders, planUpgradeRequests, approvePlanUpgrade, rejectPlanUpgrade } = useCart();
  const { user } = useUser();
  const [resellers, setResellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'vip'>('free');
  const [activeTab, setActiveTab] = useState("resellers");
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof planUpgradeRequests[0] | null>(null);
  
  // Fetch resellers from API
  useEffect(() => {
    const fetchResellers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllResellers();
        setResellers(data);
      } catch (error) {
        console.error('Error fetching resellers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResellers();
  }, []);

  const handleViewReseller = (reseller: User) => {
    setSelectedReseller(reseller);
    setViewOpen(true);
  };
  
  const handleChangePlan = (reseller: User) => {
    setSelectedReseller(reseller);
    setSelectedPlan(reseller.plan || 'free');
    setPlanOpen(true);
  };
  
  const handleUpdatePlan = async () => {
    if (selectedReseller) {
      try {
        setLoading(true);
        await userService.updateUserPlan(selectedReseller.id, selectedPlan);
        
        // Fetch fresh data instead of updating local state
        const data = await userService.getAllResellers();
        setResellers(data);
        
        setPlanOpen(false);
      } catch (error) {
        console.error('Error updating user plan:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleViewRequest = (request: typeof planUpgradeRequests[0]) => {
    setSelectedRequest(request);
    setRequestDetailsOpen(true);
  };
  
  const handleApproveRequest = (requestId: string, resellerId: string, requestedPlan: 'free' | 'basic' | 'vip') => {
    approvePlanUpgrade(requestId);
    setRequestDetailsOpen(false);
    
    // After approving, refetch the resellers to get the updated plan
    const fetchResellers = async () => {
      try {
        const data = await userService.getAllResellers();
        setResellers(data);
      } catch (error) {
        console.error('Error fetching resellers:', error);
      }
    };
    
    fetchResellers();
  };
  
  const handleRejectRequest = (requestId: string) => {
    rejectPlanUpgrade(requestId);
    setRequestDetailsOpen(false);
  };
  
  const getPlanBadge = (plan: 'free' | 'basic' | 'vip' | null) => {
    switch (plan) {
      case 'free':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800">Free</Badge>;
      case 'basic':
        return <Badge variant="outline" className="bg-kamao-purple-light text-kamao-purple-dark">Basic</Badge>;
      case 'vip':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">VIP</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };
  
  const getResellerOrders = (resellerId: string) => {
    return orders.filter(order => order.reseller_id === resellerId);
  };
  
  const calculateTotalSpent = (resellerId: string) => {
    return getResellerOrders(resellerId).reduce((sum, order) => sum + order.total, 0);
  };
  
  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const pendingRequests = planUpgradeRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resellers</h1>
      
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}
      
      {!loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="resellers">
              All Resellers
            </TabsTrigger>
            <TabsTrigger value="plan-requests" className="relative">
              Plan Upgrade Requests
              {pendingRequests.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-medium text-white">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="resellers" className="mt-6">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">No resellers found</TableCell>
                    </TableRow>
                  ) : (
                    resellers.map((reseller) => (
                      <TableRow key={reseller.id}>
                        <TableCell className="font-medium">{reseller.name}</TableCell>
                        <TableCell>{reseller.email}</TableCell>
                        <TableCell>{getPlanBadge(reseller.plan)}</TableCell>
                        <TableCell>{getResellerOrders(reseller.id).length}</TableCell>
                        <TableCell>Rs{calculateTotalSpent(reseller.id).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewReseller(reseller)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePlan(reseller)}>
                                <Upload className="mr-2 h-4 w-4" /> Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" /> Download Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="plan-requests" className="mt-6">
            {planUpgradeRequests.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reseller</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Plan</TableHead>
                      <TableHead>Requested Plan</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planUpgradeRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.reseller_name}</TableCell>
                        <TableCell>{request.reseller_email}</TableCell>
                        <TableCell>{getPlanBadge(request.current_plan)}</TableCell>
                        <TableCell>{getPlanBadge(request.requested_plan)}</TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No plan upgrade requests yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {/* View Reseller Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reseller Details</DialogTitle>
          </DialogHeader>
          
          {selectedReseller && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-6 bg-gray-100 rounded-full">
                  <UserIcon className="h-12 w-12 text-gray-500" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{selectedReseller.name}</h3>
                <p className="text-gray-500">{selectedReseller.email}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm">Plan</p>
                  <p className="font-medium mt-1">
                    {selectedReseller.plan?.toUpperCase() || 'None'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm">Orders</p>
                  <p className="font-medium mt-1">
                    {getResellerOrders(selectedReseller.id).length}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500 text-sm">Total Spent</p>
                  <p className="font-medium mt-1">
                    Rs{calculateTotalSpent(selectedReseller.id).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Orders</h4>
                {getResellerOrders(selectedReseller.id).length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No orders yet</p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getResellerOrders(selectedReseller.id)
                          .slice(0, 3)
                          .map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.id.substring(0, 8)}</TableCell>
                              <TableCell>
                                {new Date(order.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>Rs{order.total.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    order.status === 'pending' 
                                      ? 'bg-yellow-50 text-yellow-800' 
                                      : order.status === 'processing'
                                      ? 'bg-blue-50 text-blue-800'
                                      : order.status === 'completed'
                                      ? 'bg-green-50 text-green-800'
                                      : 'bg-red-50 text-red-800'
                                  }
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Change Plan Dialog */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Reseller Plan</DialogTitle>
            <DialogDescription>
              Update the access plan for {selectedReseller?.name}
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
                  <SelectItem value="basic">Basic Plan (Rs1,000/month)</SelectItem>
                  <SelectItem value="vip">VIP Plan (Rs3,000/month)</SelectItem>
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
            <Button onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Plan Request Details Dialog */}
      <Dialog open={requestDetailsOpen} onOpenChange={setRequestDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan Upgrade Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-6 bg-gray-100 rounded-full">
                  <UserIcon className="h-12 w-12 text-gray-500" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{selectedRequest.reseller_name}</h3>
                <p className="text-gray-500">{selectedRequest.reseller_email}</p>
                <div className="mt-2">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Request Date</span>
                  <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Plan</span>
                  <span className="font-medium">{selectedRequest.current_plan.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Plan</span>
                  <span className="font-medium">{selectedRequest.requested_plan.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-md bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Plan Differences</h4>
                <div className="text-sm">
                  {selectedRequest.current_plan === 'free' && selectedRequest.requested_plan === 'basic' && (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Access to premium products</li>
                      <li>Ability to place orders</li>
                      <li>Priority support</li>
                    </ul>
                  )}
                  {selectedRequest.current_plan === 'free' && selectedRequest.requested_plan === 'vip' && (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Access to ALL products</li>
                      <li>Ability to place orders</li>
                      <li>Exclusive high-profit products</li>
                      <li>Priority fulfillment</li>
                      <li>24/7 dedicated support</li>
                    </ul>
                  )}
                  {selectedRequest.current_plan === 'basic' && selectedRequest.requested_plan === 'vip' && (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Access to exclusive high-profit products</li>
                      <li>Priority fulfillment</li>
                      <li>Upgrade from priority support to 24/7 dedicated support</li>
                    </ul>
                  )}
                </div>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleApproveRequest(
                      selectedRequest.id, 
                      selectedRequest.reseller_id, 
                      selectedRequest.requested_plan
                    )}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Request
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Request
                  </Button>
                </div>
              )}
              
              {selectedRequest.status === 'approved' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p>This request was approved</p>
                </div>
              )}
              
              {selectedRequest.status === 'rejected' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  <p>This request was rejected</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResellers;
