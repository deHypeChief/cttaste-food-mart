import { useCallback } from 'react';
import { useCartStore } from '../stores/cartStore';

// Mirror the previous useCart API by selecting the store values and actions
export const useCart = () => {
  const selector = useCallback(s => ({
    items: s.items,
    count: s.count,
    total: s.total,
    loading: s.loading,
    refresh: s.refresh,
    addItem: s.addItem,
    updateQty: s.updateQty,
    removeItem: s.removeItem,
    clear: s.clear,
    // packs
    packsByVendor: s.packsByVendor,
    assignments: s.assignments,
    createPack: s.createPack,
    renamePack: s.renamePack,
    deletePack: s.deletePack,
    assignItemToPack: s.assignItemToPack,
    getItemPack: s.getItemPack,
    // pack quantities
    getPackItemQty: s.getPackItemQty,
    adjustPackItem: s.adjustPackItem,
    packItemQuantities: s.packItemQuantities,
  }), []);

  return useCartStore(selector);
};
