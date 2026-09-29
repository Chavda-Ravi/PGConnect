import api from "./api";

// Get the logged-in student's profile
export const getStudentProfile = async () => {
    const response = await api.get("/students/profile");
    return response.data;
};

// Create the logged-in student's profile
export const createStudentProfile = async (profileData) => {
    const response = await api.post("/students/profile", profileData);
    return response.data;
};

// Update the logged-in student's profile
export const updateStudentProfile = async (profileData) => {
    const response = await api.put("/students/profile", profileData);
    return response.data;
};