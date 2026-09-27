import api from "./api";

// Login
export const loginUser = async (loginData) => {
    const response = await api.post("/auth/login", loginData);
    return response.data;
};

// Register
export const registerUser = async (registerData) => {
    const response = await api.post("/auth/register", registerData);
    return response.data;
};

// Verify the stored token is still valid; returns the fresh user object
export const verifySession = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};