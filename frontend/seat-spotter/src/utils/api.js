import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor to automatically attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Or whatever key you use to store your JWT
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
