import { apiClient, API_ENDPOINTS } from './client.js';

export const favoritesService = {
  list: () => apiClient.get(API_ENDPOINTS.FAVORITES),
  toggle: (vendorId) => apiClient.post(API_ENDPOINTS.FAVORITES_TOGGLE, { vendorId }),
};
