import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CartContext from './cartContext';
import { useCartStore } from '../stores/cartStore';

export function CartProvider({ children }) {
  const { userType } = useAuth();
  const initFromLocal = useCartStore(s => s.initFromLocal);
  const setUserType = useCartStore(s => s.setUserType);
  const refresh = useCartStore(s => s.refresh);

  useEffect(() => {
    // initialize store from localStorage and set userType for refresh logic
    initFromLocal();
    setUserType(userType);
    // run initial refresh
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  // Provide a backwards-compatible context that proxies to the store selector
  const value = useCartStore(state => ({
    items: state.items,
    count: state.count,
    total: state.total,
    loading: state.loading,
    refresh: state.refresh,
    addItem: state.addItem,
    updateQty: state.updateQty,
    removeItem: state.removeItem,
    clear: state.clear,
    packsByVendor: state.packsByVendor,
    assignments: state.assignments,
    createPack: state.createPack,
    renamePack: state.renamePack,
    deletePack: state.deletePack,
    assignItemToPack: state.assignItemToPack,
    getItemPack: state.getItemPack,
    getPackItemQty: state.getPackItemQty,
    adjustPackItem: state.adjustPackItem,
    packItemQuantities: state.packItemQuantities,
  }));

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export default CartProvider;
