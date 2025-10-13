import  { useState, useEffect, useCallback } from 'react';
import { Package, Truck, Calendar, DollarSign, X, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type TableProps = { children: React.ReactNode };
const Table: React.FC<TableProps> = ({ children }) => <table className="w-full caption-bottom text-sm">{children}</table>;
const TableHeader: React.FC<TableProps> = ({ children }) => <thead className="[&_tr]:border-b">{children}</thead>;
const TableBody: React.FC<TableProps> = ({ children }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow: React.FC<TableProps> = ({ children }) => <tr className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted">{children}</tr>;
const TableHead: React.FC<CardProps> = ({ children, className = '' }) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell: React.FC<CardProps> = ({ children, className = '' }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;

type CardProps = { children: React.ReactNode; className?: string };
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-xl border bg-white text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`font-semibold tracking-tight text-xl ${className}`}>{children}</h3>
);
const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

interface ShippingAddress {
    name: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    phone: string;
}

interface OrderItem {
    product: {
        _id: string;
        name: string;
        slug: string;

    };
    name: string;
    size: string;
    material: string;
    quantity: number;
    price: number;
    image: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
    _id: string;
    orderNumber: string;
    user: string; 
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'card' | 'cash_on_delivery';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    status: OrderStatus;
    trackingNumber?: string;
    shippingProvider?: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// --- API UTILITIES (MOCKED) ---
const API_BASE_URL = 'http://localhost:4000/api/orders';

const formatCurrency = (amount: number) => 
    `LE ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'delivered': return 'bg-green-500 text-white';
        case 'shipped': return 'bg-blue-500 text-white';
        case 'processing': return 'bg-yellow-500 text-gray-900';
        case 'pending': return 'bg-gray-200 text-gray-900';
        case 'cancelled': return 'bg-red-500 text-white';
        default: return 'bg-gray-100 text-gray-900';
    }
};


interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    const renderDetailRow = (label: string, value: string | number | JSX.Element) => (
        <div className="flex justify-between py-2 border-b border-dashed">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );

    const fullAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`;

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h2>
                    <Button onClick={onClose} className="bg-transparent text-gray-900 hover:bg-gray-100 p-2 h-auto">
                        <X size={20} />
                    </Button>
                </div>

                <div className="p-6 grid md:grid-cols-3 gap-6">
                    {/* Summary Card */}
                    <Card className="md:col-span-1 p-4 bg-gray-50 border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                           <DollarSign size={20} /> Payment & Status
                        </h3>
                        {renderDetailRow('Total Amount', formatCurrency(order.totalAmount))}
                        {renderDetailRow('Payment Status', (
                            <Badge variant="secondary" className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {order.paymentStatus.toUpperCase()}
                            </Badge>
                        ))}
                        {renderDetailRow('Order Status', (
                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                                {order.status.toUpperCase()}
                            </Badge>
                        ))}
                        {renderDetailRow('Payment Method', order.paymentMethod.replace(/_/g, ' ').toUpperCase())}
                        {order.paidAt && renderDetailRow('Paid On', new Date(order.paidAt).toLocaleDateString())}
                        {order.deliveredAt && renderDetailRow('Delivered On', new Date(order.deliveredAt).toLocaleDateString())}

                        <h3 className="text-lg font-bold mt-6 mb-4 flex items-center gap-2 text-gray-700">
                            <Truck size={20} /> Shipping
                        </h3>
                        {renderDetailRow('Tracking Number', order.trackingNumber || 'N/A')}
                        {renderDetailRow('Provider', order.shippingProvider || 'N/A')}
                        {order.shippedAt && renderDetailRow('Shipped On', new Date(order.shippedAt).toLocaleDateString())}
                        <p className="mt-2 text-xs text-gray-500 break-words">{fullAddress}</p>
                    </Card>

                    {/* Items List */}
                    <Card className="md:col-span-2 p-4">
                        <h3 className="text-lg font-bold mb-4">Items ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/E5E7EB/6B7280?text=IMG' }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-600">Variant: {item.material} / {item.size}</p>
                                        <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right font-bold text-sm">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}?page=${page}&limit=${pagination.limit}`;
            const response = await fetch(url, { credentials: 'include' }); 

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch orders (Status: ${response.status})`);
            }

            const result = await response.json();
            setOrders(result.data || []);
            setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 1 });

        } catch (err: any) {
            setError(err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);


    useEffect(() => {
        fetchOrders(pagination.page);
    }, [fetchOrders, pagination.page]);

    const handleViewDetails = async (orderId: string) => {

        try {
            const url = `${API_BASE_URL}/${orderId}`;
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch order details (Status: ${response.status})`);
            }

            const result = await response.json();
            setSelectedOrder(result.data);

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const renderStatusBadge = (status: OrderStatus) => {
        const baseClasses = getStatusColor(status);
        const Icon = status === 'delivered' ? CheckCircle : status === 'shipped' ? Truck : Clock;
        return (
            <Badge variant="secondary" className={`${baseClasses} text-white font-medium capitalize flex items-center gap-1`}>
                <Icon size={14} />
                {status}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 mb-8">
                    My Order History
                </h1>

                {/* Main Orders Card */}
                <Card className="p-0 border-gray-200">
                    <CardHeader className="bg-gray-50 rounded-t-xl border-b">
                        <CardTitle className='text-xl text-gray-700'>
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className='p-0'>
                        {loading ? (
                            <div className="flex justify-center items-center h-48 text-lg text-gray-600">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading orders...
                            </div>
                        ) : error ? (
                            <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-b-xl">
                                Error fetching data: {error}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-lg text-gray-600">
                                <Package size={32} className="mb-3 text-gray-400" />
                                No orders found.
                            </div>
                        ) : (
                            
                        <div>

                        {/* Desktop & tablet view */}
                        <div className="hidden md:block">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[150px]">Order #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium text-gray-900">{order.orderNumber}</TableCell>
                                    <TableCell>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Calendar size={14} />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    </TableCell>
                                    <TableCell>{order.items.length} items</TableCell>
                                    <TableCell>{renderStatusBadge(order.status)}</TableCell>
                                    <TableCell className="text-right font-bold">
                                    {formatCurrency(order.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <Button
                                        onClick={() => handleViewDetails(order._id)}
                                        className="bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100 h-8 px-3"
                                    >
                                        View Details
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        </div>
                        
                        {/* Mobile view */}
                        <div className="block md:hidden space-y-4 w-full">
                        {orders.map((order) => (
                            <Card
                            key={order._id}
                            className="p-4 border border-gray-200 shadow-sm w-full overflow-hidden"
                            >
                            <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                Order #{order.orderNumber}
                                </h3>
                                <div className="shrink-0">{renderStatusBadge(order.status)}</div>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600 mb-1 flex flex-wrap items-center gap-1">
                                <Calendar size={14} />
                                <span className="break-words">
                                {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-700 mb-1">
                                {order.items.length} items
                            </div>

                            <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
                                <span className="font-bold text-gray-900 text-sm sm:text-base">
                                {formatCurrency(order.totalAmount)}
                                </span>
                                <Button
                                onClick={() => handleViewDetails(order._id)}
                                className="bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100 h-8 px-3 text-xs sm:text-sm whitespace-nowrap"
                                >
                                View Details
                                </Button>
                            </div>
                            </Card>
                        ))}
                        </div>

                        </div>

                        )}
                    </CardContent>
                </Card>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <div className="mt-8 flex justify-end items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className='bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                        >
                            Previous
                        </Button>
                        <Button 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className='bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
}