
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Order, useCart } from "@/contexts/CartContext";
import OrderTable from "@/components/OrderTable";
import { formatDate } from "@/lib/utils";

const AdminOrders = () => {
  const { orders, updateOrder } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [replyText, setReplyText] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setReplyText(order.reply || "");
    setViewOpen(true);
  };
  
  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    updateOrder(orderId, { status });
  };
  
  const handleSendReply = () => {
    if (selectedOrder && replyText.trim()) {
      updateOrder(selectedOrder.id, { reply: replyText });
      setViewOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      
      {/* Orders Table */}
      <OrderTable 
        orders={orders}
        onView={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        isAdmin={true}
      />
      
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
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reseller Information</h3>
                  <p className="mt-1">{selectedOrder.resellerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.resellerEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                  <div className="mt-1">
                    <Select 
                      defaultValue={selectedOrder.status}
                      onValueChange={(value) => handleUpdateStatus(
                        selectedOrder.id, 
                        value as Order['status']
                      )}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
              
              {/* Customer Message */}
              {selectedOrder.message && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Message</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{selectedOrder.message}</p>
                  </div>
                </div>
              )}
              
              {/* Reply Form */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Your Reply</h3>
                <Textarea
                  placeholder="Write a reply to the customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleSendReply} disabled={!replyText.trim()}>
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
