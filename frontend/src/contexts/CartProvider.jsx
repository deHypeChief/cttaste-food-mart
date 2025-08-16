import { useCallback, useEffect, useMemo, useState } from 'react';
import { cartService } from '../api/cart';
import { useAuth } from '../hooks/useAuth';
import CartContext from './cartContext';

export function CartProvider({ children }) {
  const { userType } = useAuth();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (userType !== 'customer') { setItems([]); setCount(0); setTotal(0); return; }
    setLoading(true);
    try {
      const res = await cartService.get();
      setItems(res?.data?.cart?.items || []);
      setCount(res?.data?.count || 0);
      setTotal(res?.data?.total || 0);
    } finally { setLoading(false); }
  }, [userType]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async ({ vendorId, menuItemId, name, price, image, quantity = 1 }) => {
    const res = await cartService.addItem({ vendorId, menuItemId, name, price, image, quantity });
    setItems(res?.data?.cart?.items || []);
    setCount(res?.data?.count || 0);
    setTotal(res?.data?.total || 0);
    return res;
  }, []);

  const updateQty = useCallback(async (menuItemId, quantity) => {
    const res = await cartService.updateQty(menuItemId, quantity);
    setItems(res?.data?.cart?.items || []);
    setCount(res?.data?.count || 0);
    setTotal(res?.data?.total || 0);
    return res;
  }, []);

  const removeItem = useCallback(async (menuItemId) => {
    const res = await cartService.removeItem(menuItemId);
    setItems(res?.data?.cart?.items || []);
    setCount(res?.data?.count || 0);
    setTotal(res?.data?.total || 0);
    return res;
  }, []);

  const clear = useCallback(async () => {
    const res = await cartService.clear();
    setItems([]); setCount(0); setTotal(0);
    return res;
  }, []);

  const value = useMemo(() => ({ items, count, total, loading, refresh, addItem, updateQty, removeItem, clear }), [items, count, total, loading, refresh, addItem, updateQty, removeItem, clear]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export default CartProvider;
