import api from "./api";

// Student / anyone with token: view availability for a PG
export const getAvailabilityByPG = async (pgId) => {
    const response = await api.get(`/availability/pg/${pgId}`);
    return response.data;
};

// Owner: create availability for one of their PGs
export const createAvailability = async (payload) => {
    const response = await api.post("/availability", payload);
    return response.data;
};

// Owner: update availability by availability record id
export const updateAvailability = async (id, payload) => {
    const response = await api.put(`/availability/${id}`, payload);
    return response.data;
};

// Owner: delete availability by availability record id
export const deleteAvailability = async (id) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
};