import axios from "axios";

const api = axios.create({
    baseURL: "https://pgconnect-backend.onrender.com/api",
    timeout: 15000,
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// If backend says token is invalid/expired, clear session and bounce to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const onAuthPage =
                window.location.pathname === "/login" ||
                window.location.pathname === "/register";

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (!onAuthPage) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default api;