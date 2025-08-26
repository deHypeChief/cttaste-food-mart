import { apiClient, API_ENDPOINTS } from './client';

export const ordersService = {
  // User places order
  async placeOrder(payload) {
  return apiClient.post(API_ENDPOINTS.ORDERS_PLACE, payload);
  },

  // Place guest order (no user session)
  async placeGuestOrder(payload) {
    return apiClient.post('/orders/guest', payload);
  },

  // User: list own orders (history)
  async listUserOrders(params = {}) {
    return apiClient.get('/orders', { params });
  },

  // Vendor: list own orders
  async listVendorOrders(params = {}) {
  return apiClient.get(API_ENDPOINTS.VENDOR_ORDERS, { params });
  },

  // Vendor: get order details
  async getVendorOrder(id) {
  return apiClient.get(API_ENDPOINTS.VENDOR_ORDER(id));
  },

  // Vendor: update order status
  async updateOrderStatus(id, status) {
  return apiClient.put(API_ENDPOINTS.VENDOR_ORDER_STATUS(id), { status });
  }
};

export default ordersService;
