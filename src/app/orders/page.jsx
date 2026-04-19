'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('vionara_token');
      if (!token) {
        return router.push('/login');
      }

      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || 'Failed to load orders');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Helper to format MongoDB date cleanly
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading your orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Continue Shopping &rarr;
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link href="/products" className="bg-black text-white px-6 py-2 rounded shadow hover:bg-gray-800">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order ID</p>
                    <p className="text-sm font-medium text-gray-900">{order._id}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-left md:text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Date Placed</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
                    <p className="text-xl font-bold text-yellow-700">₹{order.totalAmount}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-700' 
                    : order.status === 'processing' ? 'bg-blue-100 text-blue-700'
                    : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status || 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
