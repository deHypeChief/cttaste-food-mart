import api from "@/utils/configs/axios.config";

export const login = async (payload: { email: string; password: string }) => {
    const response = await api.post('/admins/sign', payload);
    // console.log(response.data)
    return response.data.data;
};

export const register = async (payload: { fullName: string; email: string; password: string; role: string }) => {
    const response = await api.post(`/admins/register?role=${payload.role}`, payload);
    // console.log(response.data)
    return response.data;
};

export const isAuthenticated = async () => {
    const response = await api.get('/auth/status/admin');
    // console.log(response.data)
    return response.data;
}

export const logoutAdmin = async () => {
    const response = await api.get('/auth/logout');
    // console.log(response.data)
    return response.data;
}

export const requestPasswordReset = async (payload: { email: string }) => {
    const response = await api.post('/admins/password/reset/request', payload);
    return response.data;
}

export const confirmPasswordReset = async (payload: { email: string; otp: string; newPassword: string }) => {
    const response = await api.post('/admins/password/reset/confirm', payload);
    return response.data;
}

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/admins/password/change', payload);
    return response.data;
}