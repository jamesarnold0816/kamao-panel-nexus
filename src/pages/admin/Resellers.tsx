
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
  User 
} from "lucide-react";
import { useUser, User } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";

// Mock resellers data
const mockResellers: User[] = [
  {
    id: 'r-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'reseller',
    plan: 'free'
  },
  {
    id: 'r-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'reseller',
    plan: 'basic'
  },
  {
    id: 'r-3',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'reseller',
    plan: 'vip'
  }
];

const AdminResellers = () => {
  const { orders } = useCart();
  const [resellers, setResellers] = useState<User[]>([]);
  const [selectedReseller, setSelectedReseller] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'vip'>('free');
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    // Here, we'll use mock data and add any resellers from orders
    const orderResellers = orders.map(order => ({
      id: order.resellerId,
      name: order.resellerName,
      email: order.resellerEmail,
      role: 'reseller' as const,
      plan: 'free' as const
    }));
    
    // Combine mock resellers with resellers from orders, avoiding duplicates
    const allResellers = [...mockResellers];
    orderResellers.forEach(reseller => {
      if (!allResellers.some(r => r.id === reseller.id)) {
        allResellers.push(reseller);
      }
    });
    
    setResellers(allResellers);
  }, [orders]);

  const handleViewReseller = (reseller: User) => {
    setSelectedReseller(reseller);
    setViewOpen(true);
  };
  
  const handleChangePlan = (reseller: User) => {
    setSelectedReseller(reseller);
    setSelectedPlan(reseller.plan || 'free');
    setPlanOpen(true);
  };
  
  const handleUpdatePlan = () => {
    if (selectedReseller) {
      setResellers(prev => 
        prev.map(r => 
          r.id === selectedReseller.id ? { ...r, plan: selectedPlan } : r
        )
      );
      setPlanOpen(false);
    }
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
    return orders.filter(order => order.resellerId === resellerId);
  };
  
  const calculateTotalSpent = (resellerId: string) => {
    return getResellerOrders(resellerId).reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resellers</h1>
      
      {/* Resellers Table */}
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
            {resellers.map((reseller) => (
              <TableRow key={reseller.id}>
                <TableCell className="font-medium">{reseller.name}</TableCell>
                <TableCell>{reseller.email}</TableCell>
                <TableCell>{getPlanBadge(reseller.plan)}</TableCell>
                <TableCell>{getResellerOrders(reseller.id).length}</TableCell>
                <TableCell>₹{calculateTotalSpent(reseller.id).toLocaleString()}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
      
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
                  <User className="h-12 w-12 text-gray-500" />
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
                    ₹{calculateTotalSpent(selectedReseller.id).toLocaleString()}
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
                                {new Date(order.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>₹{order.total.toLocaleString()}</TableCell>
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
            <Button onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResellers;
