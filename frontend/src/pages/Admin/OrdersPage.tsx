import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface User {
  name: string;
  email: string;
}

interface OrderItem {
  name: string;
  material: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/orders/admin/all", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Update delivery/status
const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // include cookies if using auth
      body: JSON.stringify({ status: newStatus }), // body must contain 'status'
    });

    const data = await response.json();

    if (!response.ok) {
      // show more descriptive error if available
      throw new Error(data.message || "Failed to update order status");
    }

    // ✅ Success case
    toast.success(`Order status updated to "${newStatus}"`);
    fetchOrders(); // Refresh the order list after update

  } catch (error: any) {
    console.error("Error updating order status:", error);
    toast.error(error.message || "Error updating status");
  }
};


  //  Update payment status
  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${orderId}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment status updated!");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (err) {
      toast.error("Error updating payment status");
      console.error(err);
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No orders found.</p>
        ) : (
          <>
          {/* Large screens: Table layout */}
          <div className="hidden min-[1060px]:block w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 sm:p-3 text-left font-medium">#</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Customer</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Total</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Payment</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Payment Status</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Delivery Status</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Date</th>
                  <th className="p-2 sm:p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50">
                    <td className="p-2 sm:p-3">{o.orderNumber}</td>

                    <td className="p-2 sm:p-3 truncate">
                      <div className="flex flex-col">
                        <span className="truncate">{o.user?.name || "Unknown"}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {o.user?.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      LE {o.totalAmount.toLocaleString()}
                    </td>

                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <Badge variant={o.paymentStatus === "paid" ? "default" : "secondary"}>
                        {o.paymentMethod === "cash_on_delivery" ? "COD" : "Card"}
                      </Badge>
                    </td>

                    <td className="p-2 sm:p-3">
                      <Select onValueChange={(v) => handlePaymentStatusChange(o._id, v)}>
                        <SelectTrigger className="w-[90px] sm:w-[110px] md:w-[130px] h-8 text-xs">
                          <SelectValue placeholder={o.paymentStatus} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="p-2 sm:p-3">
                      <Select onValueChange={(v) => handleStatusChange(o._id, v)}>
                        <SelectTrigger className="w-[90px] sm:w-[110px] md:w-[130px] h-8 text-xs">
                          <SelectValue placeholder={o.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="p-2 sm:p-3 whitespace-nowrap text-xs">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-2 sm:p-3 text-right">
                      <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Small screens: Card layout */}
          <div className="block min-[1060px]:hidden space-y-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="border rounded-lg p-4 shadow-sm bg-white text-sm flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Order #{o.orderNumber}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <p className="font-medium">{o.user?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{o.user?.email}</p>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span>LE {o.totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment:</span>
                  <Badge variant={o.paymentStatus === "paid" ? "default" : "secondary"}>
                    {o.paymentMethod === "cash_on_delivery" ? "COD" : "Card"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment Status:</span>
                  <Select onValueChange={(v) => handlePaymentStatusChange(o._id, v)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder={o.paymentStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivery Status:</span>
                  <Select onValueChange={(v) => handleStatusChange(o._id, v)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder={o.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-2 text-right">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
