import { apiClient, API_ENDPOINTS } from './client';

export const vendorService = {
  list: async ({ location, vendorType, search, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (vendorType) params.set('vendorType', vendorType);
    if (search) params.set('search', search);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return apiClient.get(`/vendors${qs ? `?${qs}` : ''}`);
  },
  getPublic: async (id) => apiClient.get(`/vendors/${id}`),
  getPublicMenu: async (id) => apiClient.get(`/vendors/${id}/menu`),
  getComments: async (id) => apiClient.get(`/vendors/${id}/comments`),
  addComment: async (id, { userName, rating, comment }) =>
    apiClient.post(`/vendors/${id}/comments`, { userName, rating, comment }),
  getWorkingHours: async () => {
    return apiClient.get(API_ENDPOINTS.VENDOR_WORKING_HOURS);
  },
  updateWorkingHours: async (workingHours) => {
    return apiClient.put(API_ENDPOINTS.VENDOR_WORKING_HOURS, { workingHours });
  },
  uploadBanner: async (file) => {
    const form = new FormData();
    form.append('image', file);
    return apiClient.post(API_ENDPOINTS.VENDOR_BANNER, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('image', file);
    return apiClient.post(API_ENDPOINTS.VENDOR_AVATAR, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteVendor: async () => apiClient.delete(API_ENDPOINTS.DELETE_VENDOR),
};
