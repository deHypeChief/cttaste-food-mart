// import type { z } from "zod";
import api from "@/utils/configs/axios.config";


class Endpoint {
    // Users Endpoints
    public static async getUsers() {
        const response = await api.get('/users/admin/getUsers');
        console.log(response.data)
        return response.data;
    }

    // Vendors Endpoints (Admin)
    public static async getVendors(params?: { status?: 'pending' | 'approved' | 'all'; search?: string; page?: number; limit?: number }) {
        const usp = new URLSearchParams();
        if (params?.status) usp.set('status', params.status);
        if (params?.search) usp.set('search', params.search);
        if (params?.page) usp.set('page', String(params.page));
        if (params?.limit) usp.set('limit', String(params.limit));
        const query = usp.toString();
        const response = await api.get(`/admins/vendors${query ? `?${query}` : ''}`);
        return response.data;
    }

    public static async approveVendor(id: string, isApproved: boolean = true) {
        const response = await api.patch(`/admins/vendors/${id}/approve`, { isApproved });
        return response.data;
    }

    public static async getVendorsAnalytics() {
        const response = await api.get('/admins/vendors/analytics');
        return response.data;
    }
}

export default Endpoint