import api from "./api";

// Get the logged-in PG owner's profile
export const getOwnerProfile = async () => {
    const response = await api.get("/pgowners/profile");
    return response.data;
};

// Create the logged-in PG owner's profile
export const createOwnerProfile = async (profileData) => {
    const response = await api.post("/pgowners/profile", profileData);
    return response.data;
};

// Update the logged-in PG owner's profile
export const updateOwnerProfile = async (profileData) => {
    const response = await api.put("/pgowners/profile", profileData);
    return response.data;
};