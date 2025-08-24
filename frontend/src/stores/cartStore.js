import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { cartService } from '../api/cart';

// Helper to safely read localStorage
const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // ignore parse errors
    return fallback;
  }
};
const writeLocal = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
};

export const useCartStore = create(devtools((set, get) => ({
  items: [],
  count: 0,
  total: 0,
  loading: false,

  // packs
  packsByVendor: {},
  assignments: {},
  packItemQuantities: {},

  // initialize from local storage
  initFromLocal: () => {
    const data = readLocal('cartPackData', {});
    set({
      packsByVendor: data.packsByVendor || {},
      assignments: data.assignments || {},
      packItemQuantities: data.packItemQuantities || {},
    });
  },

  persistPacks: async () => {
    // Read authoritative values from the live store to avoid persisting stale snapshots
    const state = get();
    const packs = state.packsByVendor || {};
    const assignments = state.assignments || {};
    const quantities = state.packItemQuantities || {};
    // persist to localStorage first
    writeLocal('cartPackData', { packsByVendor: packs, assignments, packItemQuantities: quantities });
    try {
      await cartService.updatePacks({ packsByVendor: packs, assignments, packItemQuantities: quantities });
    } catch {
      // best-effort, ignore network failures
    }
  },

  ensureDefaultPack: (vendorId) => {
    if (!vendorId) return;
    set(prev => {
      const existing = prev.packsByVendor[vendorId] || {};
      if (Object.keys(existing).length) return {};
      const next = { ...prev.packsByVendor, [vendorId]: { 'pack-1': { id: 'pack-1', name: 'Pack 1' } } };
      // persist async
      setTimeout(() => get().persistPacks(next, get().assignments), 0);
      return { packsByVendor: next };
    });
  },

  createPack: (vendorId) => {
    let newId = '';
    set(prev => {
      const existing = prev.packsByVendor[vendorId] || {};
      let idx = Object.keys(existing).length + 1;
      while (existing[`pack-${idx}`]) idx += 1;
      newId = `pack-${idx}`;
      const nextVendorPacks = { ...existing, [newId]: { id: newId, name: `Pack ${idx}` } };
      const next = { ...prev.packsByVendor, [vendorId]: nextVendorPacks };
      // persist
      setTimeout(() => get().persistPacks(next, prev.assignments), 0);
      return { packsByVendor: next };
    });
    return newId;
  },

  renamePack: (vendorId, packId, name) => {
    set(prev => {
      const vendorPacks = prev.packsByVendor[vendorId];
      if (!vendorPacks?.[packId]) return {};
      const nextVendor = { ...vendorPacks, [packId]: { ...vendorPacks[packId], name: name || vendorPacks[packId].name } };
      const next = { ...prev.packsByVendor, [vendorId]: nextVendor };
      setTimeout(() => get().persistPacks(next, prev.assignments), 0);
      return { packsByVendor: next };
    });
  },

  deletePack: (vendorId, packId) => {
    set(prev => {
      const vendorPacks = prev.packsByVendor[vendorId];
      if (!vendorPacks?.[packId]) return {};
      const { [packId]: _, ...rest } = vendorPacks;
      const nextVendor = Object.keys(rest).length ? rest : { 'pack-1': { id: 'pack-1', name: 'Pack 1' } };
      const next = { ...prev.packsByVendor, [vendorId]: nextVendor };
      // reassign
      const nextAssignments = { ...prev.assignments };
      for (const [mid, meta] of Object.entries(prev.assignments)) {
        if (meta.vendorId === vendorId && meta.packId === packId) {
          const fallback = Object.keys(nextVendor)[0];
          nextAssignments[mid] = { vendorId, packId: fallback };
        }
      }
      setTimeout(() => get().persistPacks(next, nextAssignments), 0);
      return { packsByVendor: next, assignments: nextAssignments };
    });
  },

  assignItemToPack: (menuItemId, vendorId, packId) => {
    if (!menuItemId || !vendorId || !packId) return;
    get().ensureDefaultPack(vendorId);
    set(prev => {
      const next = { ...prev.assignments, [menuItemId]: { vendorId, packId } };
      setTimeout(() => get().persistPacks(prev.packsByVendor, next), 0);
      return { assignments: next };
    });
  },

  getItemPack: (menuItemId) => {
    const s = get();
    return s.assignments[menuItemId]?.packId || 'pack-1';
  },

  getPackItemQty: (vendorId, packId, menuItemId) => {
    const s = get();
    try {
      return (((s.packItemQuantities || {})[vendorId] || {})[packId] || {})[menuItemId] || 0;
    } catch {
      return 0;
    }
  },

  // server interactions
  refresh: async () => {
    const s = get();
    if (s.userType !== 'customer') { set({ items: [], count: 0, total: 0 }); return; }
    set({ loading: true });
    try {
      const res = await cartService.get();
      const items = res?.data?.cart?.items || [];
      const count = res?.data?.count || 0;
      const total = res?.data?.total || 0;
      set({ items, count, total });

      // If the server returned explicit pack state, prefer it (server is authoritative).
      const serverPacks = res?.data?.cart?.packsByVendor;
      const serverAssignments = res?.data?.cart?.assignments;
      const serverQuantities = res?.data?.cart?.packItemQuantities;
      if (serverPacks || serverAssignments || serverQuantities) {
        set({
          packsByVendor: serverPacks || {},
          assignments: serverAssignments || {},
          packItemQuantities: serverQuantities || {},
        });
      } else {
        // ensure default packs and assignments (backfill from server aggregated items)
        items.forEach(it => {
          if (it.vendorId) get().ensureDefaultPack(it.vendorId);
          if (!get().assignments[it.menuItemId]) {
            const next = { ...get().assignments, [it.menuItemId]: { vendorId: it.vendorId, packId: 'pack-1' } };
            set({ assignments: next });
            setTimeout(() => get().persistPacks(get().packsByVendor, next), 0);
          }
        });

        // populate packItemQuantities if missing
        const prev = get();
        let changed = false;
        const next = { ...prev.packItemQuantities };
        items.forEach(it => {
          const vid = it.vendorId; if (!vid) return;
          const serverQty = Number(it.quantity || 0); if (serverQty <= 0) return;
          const vendorPacks = next[vid] || {};
          let distributed = 0;
          Object.values(vendorPacks).forEach(obj => { distributed += Number(obj[it.menuItemId] || 0); });
          if (distributed < serverQty) {
            const assignPack = prev.assignments[it.menuItemId]?.packId || 'pack-1';
            if (!vendorPacks[assignPack]) vendorPacks[assignPack] = {};
            vendorPacks[assignPack][it.menuItemId] = (vendorPacks[assignPack][it.menuItemId] || 0) + (serverQty - distributed);
            next[vid] = vendorPacks;
            changed = true;
          }
        });
        if (changed) {
          set({ packItemQuantities: next });
          setTimeout(() => get().persistPacks(get().packsByVendor, get().assignments, next), 0);
        }
      }

    } finally { set({ loading: false }); }
  },

  updateQty: async (menuItemId, quantity) => {
    const res = await cartService.updateQty(menuItemId, quantity);
    set({ items: res?.data?.cart?.items || [], count: res?.data?.count || 0, total: res?.data?.total || 0 });
    return res;
  },

  removeItem: async (menuItemId) => {
    const res = await cartService.removeItem(menuItemId);
    set({ items: res?.data?.cart?.items || [], count: res?.data?.count || 0, total: res?.data?.total || 0 });
    const state = get();
    if (state.assignments[menuItemId]) {
      const { [menuItemId]: _, ...rest } = state.assignments;
      set({ assignments: rest });
      setTimeout(() => get().persistPacks(get().packsByVendor, rest), 0);
    }
    return res;
  },

  adjustPackItem: async ({ vendorId, packId, menuItemId, name, price, image }, delta) => {
    if (!vendorId || !packId || !menuItemId || !delta) return;
    get().ensureDefaultPack(vendorId);
    // update quantities locally
    set(prev => {
      const v = { ...(prev.packItemQuantities[vendorId] || {}) };
      const p = { ...(v[packId] || {}) };
      const nextQty = (p[menuItemId] || 0) + delta;
      if (nextQty <= 0) delete p[menuItemId]; else p[menuItemId] = nextQty;
      v[packId] = p;
      const next = { ...prev.packItemQuantities, [vendorId]: v };
      set({ packItemQuantities: next });
      setTimeout(() => get().persistPacks(get().packsByVendor, get().assignments, next), 0);
      return {};
    });

    // compute total aggregated quantity across packs for this item
    const existingVendorPacks = get().packItemQuantities[vendorId] || {};
    let totalForItem = delta;
    Object.entries(existingVendorPacks).forEach(([pid, obj]) => {
      if (pid === packId) return;
      totalForItem += obj[menuItemId] || 0;
    });
    const serverItem = (get().items || []).find(i => i.menuItemId === menuItemId);
    if (!serverItem && totalForItem > 0) {
      await cartService.addItem({ vendorId, menuItemId, name, price, image, quantity: totalForItem });
      await get().refresh();
    } else if (serverItem) {
      const newQty = (serverItem.quantity || 0) + delta;
      if (newQty <= 0) {
        await get().removeItem(menuItemId);
      } else if (newQty !== serverItem.quantity) {
        await get().updateQty(menuItemId, newQty);
      }
    }

    // update assignment
    set(prev => {
      const all = prev.packItemQuantities[vendorId] || {};
      const withNew = { ...all, [packId]: { ...(all[packId] || {}) } };
      const currentVal = (withNew[packId][menuItemId] || 0) + delta;
      if (currentVal <= 0) delete withNew[packId][menuItemId]; else withNew[packId][menuItemId] = currentVal;
      const foundPack = Object.entries(withNew).find(([, obj]) => obj[menuItemId] > 0)?.[0] || packId;
      const next = { ...prev.assignments, [menuItemId]: { vendorId, packId: foundPack } };
      set({ assignments: next });
      setTimeout(() => get().persistPacks(get().packsByVendor, next, get().packItemQuantities), 0);
      return {};
    });
  },

  addItem: async ({ vendorId, menuItemId, name, price, image, quantity = 1, packId }) => {
    const res = await cartService.addItem({ vendorId, menuItemId, name, price, image, quantity });
    set({ items: res?.data?.cart?.items || [], count: res?.data?.count || 0, total: res?.data?.total || 0 });
    if (vendorId) get().ensureDefaultPack(vendorId);
    if (packId) get().assignItemToPack(menuItemId, vendorId, packId);
    return res;
  },

  clear: async () => {
    const res = await cartService.clear();
    // clear local store and ensure pack state is persisted as cleared
    set({ items: [], count: 0, total: 0, assignments: {}, packItemQuantities: {}, packsByVendor: {} });
    try { localStorage.removeItem('cartPackData'); } catch { /* ignore */ }
    try {
      // ensure server-side pack state is cleared too (best-effort)
      await get().persistPacks();
    } catch { /* ignore */ }
    return res;
  },

  // userType will be set by provider wrapper
  userType: undefined,
  setUserType: (t) => set({ userType: t }),

})));
