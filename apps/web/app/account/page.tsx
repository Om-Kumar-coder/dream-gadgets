'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';

export default function AccountPage() {
  const { user, logout } = useWebAuthStore();

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => apiClient.get('/public/orders').then(r => r.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">My Account</h1>
        <p className="text-muted-foreground mb-6">Please log in to view your account.</p>
        <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <h2 className="font-semibold mb-4">My Orders</h2>
      {(orders?.data?.data ?? []).length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/products" className="text-primary hover:underline mt-2 block">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders?.data?.data ?? []).map((order: any) => (
            <Link key={order.id} href={`/orders/${order.id}`}
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.orderedAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
