
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import OrderTable from "@/components/OrderTable";
import { Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";

const ResellerOrders = () => {
  const { orders } = useCart();
  const { user } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messageText, setMessageText] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  
  // Filter orders for current user
  const userOrders = user 
    ? orders.filter(order => order.resellerId === user.id)
    : [];
  
  // Group orders by status
  const pendingOrders = userOrders.filter(order => 
    order.status === 'pending' || order.status === 'processing'
  );
  const completedOrders = userOrders.filter(order => 
    order.status === 'completed'
  );
  const cancelledOrders = userOrders.filter(order => 
    order.status === 'cancelled'
  );
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setMessageText(order.message || "");
    setViewOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            View and manage your orders
          </p>
        </div>
        
        {userOrders.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Orders ({userOrders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending/Processing ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <OrderTable 
                orders={userOrders}
                onView={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="pending">
              <OrderTable 
                orders={pendingOrders}
                onView={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="completed">
              <OrderTable 
                orders={completedOrders}
                onView={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <OrderTable 
                orders={cancelledOrders}
                onView={handleViewOrder}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <PackageCheck className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link to="/reseller/products">Browse Products</Link>
            </Button>
          </div>
        )}
        
        {/* View Order Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?.id.substring(0, 8)} - {selectedOrder && formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Status */}
                <div className="p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                      <p className="mt-1 font-medium">
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status === 'pending' && "Awaiting Processing"}
                      {selectedOrder.status === 'processing' && "In Progress"}
                      {selectedOrder.status === 'completed' && "Completed"}
                      {selectedOrder.status === 'cancelled' && "Cancelled"}
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img 
                                  src={item.product.image || '/placeholder.svg'} 
                                  alt={item.product.name} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.product.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ₹{item.product.price.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            Total:
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                            ₹{selectedOrder.total.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Message Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Messages</h3>
                  
                  {selectedOrder.message && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">Your Message:</div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-700">{selectedOrder.message}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedOrder.reply && (
                    <div>
                      <div className="text-sm font-medium mb-1">Admin Reply:</div>
                      <div className="bg-kamao-purple-light p-4 rounded-md">
                        <p className="text-sm text-gray-700">{selectedOrder.reply}</p>
                      </div>
                    </div>
                  )}
                  
                  {!selectedOrder.message && !selectedOrder.reply && (
                    <p className="text-sm text-gray-500">No messages for this order.</p>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResellerOrders;
