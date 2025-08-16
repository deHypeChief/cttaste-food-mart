import { apiClient, API_ENDPOINTS } from './client.js';

export const menuService = {
  list: async () => apiClient.get(API_ENDPOINTS.MENU_LIST),
  create: async (data) => apiClient.post(API_ENDPOINTS.MENU_LIST, data),
  update: async (id, data) => apiClient.put(API_ENDPOINTS.MENU_ITEM(id), data),
  remove: async (id) => apiClient.delete(API_ENDPOINTS.MENU_ITEM(id)),
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    console.log('Uploading image:', { fileName: file.name, fileSize: file.size, endpoint: API_ENDPOINTS.MENU_IMAGE(id) });
    return apiClient.post(API_ENDPOINTS.MENU_IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      maxBodyLength: 1 * 1024 * 1024,
    });
  }
};
