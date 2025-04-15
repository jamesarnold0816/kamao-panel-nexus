import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye,
  CheckCircle2, 
  XCircle,
  Clock 
} from "lucide-react";
import { Order } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  isAdmin?: boolean;
}

const OrderTable = ({ orders, onView, onUpdateStatus, isAdmin = false }: OrderTableProps) => {
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>{isAdmin ? 'Reseller' : 'Date'}</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                <TableCell>
                  {isAdmin 
                    ? order.resellerName
                    : formatDate(order.createdAt)
                  }
                </TableCell>
                <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusBadge(order.status)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(order)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      {isAdmin && onUpdateStatus && (
                        <>
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'processing')}>
                              <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark as Processing
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'completed')}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'cancelled')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel Order
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
