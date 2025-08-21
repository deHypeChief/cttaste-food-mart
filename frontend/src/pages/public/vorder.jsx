import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/button';
import { apiClient } from '../../api/client';

export default function VOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await apiClient.get(`/orders/public/${id}`);
        // apiClient returns response data; be defensive about shapes
        const payload = res?.order || res?.data || res;
        if (!alive) return;
        const o = payload?.order || payload || null;
        setOrder(o);
      } catch (e) {
        setError(e.message || 'Failed to load order');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const updateStatus = async (status) => {
    if (!order?._id) return;
    try {
      setUpdating(true);
      await apiClient.put(`/orders/public/${order._id}/status`, { status });
      // try to close the window; if it fails, inform the user
      try { window.close(); } catch { /* ignore */ }
      alert(`Order ${status}. You can close this tab.`);
    } catch (e) {
      alert(e.message || 'Failed to update order');
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="p-6">Loading order…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const items = order.items || [];
  const vendor = order.vendorId || order.vendor || null;

  return (
    <div className="mx-4 md:mx-20 mt-8">
      <div className="bg-white p-6 rounded shadow">
        {/* Vendor header */}
        <div className="flex items-center gap-4">
          <div className="h-[64px] w-[64px] rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {vendor?.avatar ? (
              <img src={vendor.avatar} alt={vendor.restaurantName || 'Vendor'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">🏬</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{vendor?.restaurantName || 'Vendor'}</h2>
            <p className="text-sm opacity-60">Order: <span className="font-mono">{order.orderNumber || order._id}</span></p>
            <p className="text-sm opacity-60">Status: <strong>{order.status}</strong></p>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
          <div>
            <h3 className="font-medium text-lg">Items</h3>
            <div className="space-y-4 mt-4">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-4 items-center border rounded p-3">
                  <div className="h-[72px] w-[72px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">🍽️</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm opacity-60 mt-1">Qty: {it.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₦ {Number(it.price * it.quantity).toLocaleString()}</div>
                        <div className="text-sm opacity-60">₦ {Number(it.price).toLocaleString()} ea</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {order.notes && <div className="mt-4 p-3 bg-yellow-50 rounded border">Notes: <div className="mt-1 text-sm">{order.notes}</div></div>}
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-4">
              <div className="text-sm opacity-60">Customer</div>
              <div className="font-medium">{order.userName || order.customerName || 'Customer'}</div>
              <div className="text-sm opacity-60">{order.address}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm opacity-60">Created</div>
              <div className="font-medium">{new Date(order.createdAt || order.created || Date.now()).toLocaleString()}</div>
            </div>

            <div className="mb-6">
              <div className="text-sm opacity-60">Total</div>
              <div className="font-semibold text-2xl">₦ {Number(order.total || 0).toLocaleString()}</div>
            </div>

            <div className="flex gap-3">
              <Button variant="danger" className="w-full" onClick={() => updateStatus('Cancelled')} disabled={updating}>Reject</Button>
              <Button variant="primary" className="w-full" onClick={() => updateStatus('Accepted')} disabled={updating}>Confirm</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}