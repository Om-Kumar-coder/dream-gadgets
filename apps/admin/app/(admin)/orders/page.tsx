'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/orders').then(r => r.data),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Online Orders</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Order #</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data?.data ?? []).map((order: any) => (
                <tr key={order.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono">{order.orderNumber}</td>
                  <td className="p-3">{order.clientId ?? 'Guest'}</td>
                  <td className="p-3">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(order.orderedAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {(data?.data?.data ?? []).length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
