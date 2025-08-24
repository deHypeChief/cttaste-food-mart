import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/button";
import { apiClient } from "../../api/client";
import { useAuth } from "../../hooks/useAuth.js";

export default function VOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { vendor: authVendor, isLoading: authLoading, userType } = useAuth();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get(`/orders/public/${id}`);
        // apiClient returns response data; be defensive about shapes
        const payload = res?.order || res?.data || res;
        if (!alive) return;
        const o = payload?.order || payload || null;
        setOrder(o);
      } catch (e) {
        setError(e.message || "Failed to load order");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Protect page: only the vendor who the order belongs to should access it.
  useEffect(() => {
    if (loading || authLoading) return; // still resolving
    if (!order) return; // nothing to check yet

	console.log(userType)

    // If a vendor is authenticated, ensure they match the order.vendorId
    if (userType === "vendor") {
      const orderVendorId =
        order?.vendorId?._id ||
        order?.vendorId ||
        order?.vendor?._id ||
        order?.vendor;
      const authVendorId = authVendor?.vendor._id || authVendor?.id || authVendor;

	  console.log({ orderVendorId, authVendorId })
      if (
        authVendorId &&
        orderVendorId &&
        String(authVendorId) !== String(orderVendorId)
      ) {
        // Authenticated as a vendor but wrong vendor for this order.
        // Show modal letting the user re-login as the correct vendor or go home.
        const redirectTo = encodeURIComponent(`/vorder/${id}`);
        setModalMessage(
          "This order belongs to a different vendor. Sign in with the correct vendor account to view and manage this order."
        );
        setShowModal(true);
        // store target url on window for modal action
        window.__vorderRedirect = `/auth/login?type=vendor&redirect=${redirectTo}`;
        return; // stop further checks
      }
        // If vendor owns the order and it is already confirmed / moved past Pending, send them to dashboard
        const progressedStatuses = ['Accepted','Preparing','Ready','Completed','Cancelled'];
        if (order?.status && progressedStatuses.includes(order.status)) {
          navigate(`/vendor?order=${order._id}&status=${order.status}`, { replace: true });
          return;
        }
    } else {
      // If not a vendor (customer or unauthenticated) disallow access
      // If the user is not a vendor or is unauthenticated, redirect to vendor login
      const redirectTo = encodeURIComponent(`/vorder/${id}`);
      setModalMessage(
        "Only the vendor assigned to this order can view it. Please sign in as the vendor to continue."
      );
      setShowModal(true);
      window.__vorderRedirect = `/auth/login?type=vendor&redirect=${redirectTo}`;
    }
  }, [order, loading, authVendor, authLoading, userType, navigate, id]);

  const updateStatus = async (status) => {
    if (!order?._id) return;
    try {
      setUpdating(true);
      await apiClient.put(`/orders/public/${order._id}/status`, { status });
      // try to close the window; if it fails, inform the user
      try {
        window.close();
      } catch {
        /* ignore */
      }
      alert(`Order ${status}. You can close this tab.`);
    } catch (e) {
      alert(e.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Loading order…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const items = order.items || [];
  const vendor = order.vendorId || order.vendor || null;

  // Build grouped items (prefer server-provided pack shapes if present)
  const groupedItems = (() => {
    if (!Array.isArray(items) || items.length === 0) return { hasPacks: false, groups: [] };

    // prefer pack shapes attached to the order (server-authoritative)
    const orderPacks = order.packsByVendor || order.cart?.packsByVendor || null;
    const orderPackQty = order.packItemQuantities || order.cart?.packItemQuantities || null;

    // Normalize vendor key to string and fall back to first vendor key in server payload.
    let vendorIdKey = null;
    if (vendor) {
      const cand = vendor?._id || vendor?.id || vendor;
      if (cand != null) vendorIdKey = String(cand);
    }
    if (!vendorIdKey && orderPackQty) {
      const keys = Object.keys(orderPackQty || {});
      if (keys.length === 1) vendorIdKey = keys[0];
    }

    if (orderPackQty && vendorIdKey && orderPackQty[vendorIdKey]) {
      const vendorPackObj = orderPackQty[vendorIdKey] || {};
      const groups = Object.keys(vendorPackObj).map((pid) => {
        const qtyObj = vendorPackObj[pid] || {};
        const name = orderPacks?.[vendorIdKey]?.[pid]?.name || pid;
        const groupItems = Object.keys(qtyObj).map((mid) => {
          const base = items.find(it => String(it.menuItemId || it._id || it.id) === String(mid));
          const qty = Number(qtyObj[mid] || 0);
          return base ? { ...base, quantity: qty } : { menuItemId: mid, name: 'Item', quantity: qty };
        }).filter(Boolean);
        return { id: pid, name, items: groupItems };
      });
      return { hasPacks: true, groups };
    }

    // next fallback: items themselves may carry packId/packName
    const hasPack = items.some((it) => it && (it.packId || it.packName));
    if (!hasPack) return { hasPacks: false, groups: [{ id: '__default', name: null, items }] };

    const map = new Map();
    items.forEach((it) => {
      const pid = it.packId || '__default';
      const pname = it.packName || (pid === '__default' ? null : `Pack ${pid}`);
      if (!map.has(pid)) map.set(pid, { id: pid, name: pname, items: [] });
      map.get(pid).items.push(it);
    });

    return { hasPacks: true, groups: Array.from(map.values()) };
  })();

  return (
    <div className="mx-4 md:mx-20 mt-8">
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[min(600px,90%)]">
            <h3 className="text-lg font-semibold">Access required</h3>
            <p className="mt-3 text-sm text-gray-700">{modalMessage}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  setShowModal(false);
                  setModalMessage("");
                  navigate("/");
                }}
              >
                Go home
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={() => {
                  const u = window.__vorderRedirect;
                  if (u) navigate(u);
                  else navigate("/auth/login?type=vendor");
                }}
              >
                Login as vendor
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white p-6 rounded shadow">
        {/* Vendor header */}
        <div className="flex items-center gap-4">
          <div className="h-[64px] w-[64px] rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {vendor?.avatar ? (
              <img
                src={vendor.avatar}
                alt={vendor.restaurantName || "Vendor"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                🏬
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {vendor?.restaurantName || "Vendor"}
            </h2>
            <p className="text-sm opacity-60">
              Order:{" "}
              <span className="font-mono">
                {order.orderNumber || order._id}
              </span>
            </p>
            <p className="text-sm opacity-60">
              Status: <strong>{order.status}</strong>
            </p>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
          <div>
            <h3 className="font-medium text-lg">Items</h3>
            <div className="space-y-4 mt-4">
              {/* If packs exist, render groups with headers; otherwise render flat list */}
              {groupedItems.hasPacks
                ? groupedItems.groups.map((g) => (
                    <div key={g.id} className="space-y-2">
                      <div className="px-3 py-2 bg-gray-100 rounded font-medium">{g.name || 'Pack'}</div>
                      {g.items.map((it, idx) => (
                        <div key={idx} className="flex gap-4 items-center border rounded p-3">
                          <div className="h-[72px] w-[72px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {it.image ? (
                              <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">🍽️</div>
                            )}
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
                  ))
                : groupedItems.groups[0].items.map((it, idx) => (
                    <div key={idx} className="flex gap-4 items-center border rounded p-3">
                      <div className="h-[72px] w-[72px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">🍽️</div>
                        )}
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
            {order.notes && (
              <div className="mt-4 p-3 bg-yellow-50 rounded border">
                Notes: <div className="mt-1 text-sm">{order.notes}</div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-4">
              <div className="text-sm opacity-60">Customer</div>
              <div className="font-medium">
                {order.userName || order.customerName || "Customer"}
              </div>
              <div className="text-sm opacity-60">{order.address}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm opacity-60">Created</div>
              <div className="font-medium">
                {new Date(
                  order.createdAt || order.created || Date.now()
                ).toLocaleString()}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm opacity-60">Total</div>
              <div className="font-semibold text-2xl">
                ₦ {Number(order.total || 0).toLocaleString()}
              </div>
            </div>

              {order.deliveryMode === 'doorstep' && (
                <div className="mb-6 p-3 bg-white border rounded">
                  <div className="text-sm opacity-60">Delivery</div>
                  <div className="font-medium">Doorstep</div>
                  {order.deliveryLocation && (
                    <div className="text-sm opacity-60 mt-1">
                      Location: {order.deliveryLocation}
                    </div>
                  )}
                  {order.deliveryPrice != null && (
                    <div className="text-sm opacity-60 mt-1">
                      Fee: ₦ {Number(order.deliveryPrice || 0).toLocaleString()}
                    </div>
                  )}
                  {order.deliveryInstructions && (
                    <div className="mt-2 text-sm">Instructions: {order.deliveryInstructions}</div>
                  )}
                </div>
              )}

            <div className="flex gap-3">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => updateStatus("Cancelled")}
                disabled={updating}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => updateStatus("Accepted")}
                disabled={updating}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
