// import type { z } from "zod";
import api from "@/utils/configs/axios.config";


class Endpoint {
    // Users Endpoints
    public static async getUsers() {
        const response = await api.get('/users/admin/getUsers');
        console.log(response.data)
        return response.data;
    }
}

export default Endpoint