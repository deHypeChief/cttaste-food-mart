import { apiClient, API_ENDPOINTS } from './client';

export const cartService = {
  get: () => apiClient.get(API_ENDPOINTS.CART),
  addItem: (payload) => apiClient.post(API_ENDPOINTS.CART_ITEMS, payload),
  updateQty: (menuItemId, quantity) => apiClient.patch(API_ENDPOINTS.CART_ITEM(menuItemId), { quantity }),
  removeItem: (menuItemId) => apiClient.delete(API_ENDPOINTS.CART_ITEM(menuItemId)),
  clear: () => apiClient.delete(API_ENDPOINTS.CART),
};
