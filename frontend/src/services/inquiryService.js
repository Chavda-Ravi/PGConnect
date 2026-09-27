import api from "./api";

// Student: send an inquiry about a PG
export const createInquiry = async ({ pgId, message }) => {
    const response = await api.post("/inquiries", { pgId, message });
    return response.data;
};

// Student: get all inquiries I have sent
export const getMyInquiries = async () => {
    const response = await api.get("/inquiries/student");
    return response.data;
};

// Owner: get all inquiries on my PGs
export const getOwnerInquiries = async () => {
    const response = await api.get("/inquiries/owner");
    return response.data;
};

// Owner: respond to an inquiry
export const respondToInquiry = async (id, { response, status }) => {
    const apiResponse = await api.put(`/inquiries/${id}/respond`, {
        response,
        status,
    });
    return apiResponse.data;
};