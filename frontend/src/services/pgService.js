import api from "./api";

/* ---------- Discovery (student / public) ---------- */

export const getAllPGs = async () => {
    const response = await api.get("/discovery/pgs");
    return response.data;
};

export const searchPGs = async ({ state, city }) => {
    const params = {};

    if (state && state.trim() !== "") {
        params.state = state.trim();
    }

    if (city && city.trim() !== "") {
        params.city = city.trim();
    }

    const response = await api.get("/discovery/pgs/search", { params });
    return response.data;
};

export const getPGById = async (id) => {
    const response = await api.get(`/discovery/pgs/${id}`);
    return response.data;
};

/* ---------- Owner CRUD ---------- */

export const getMyPGs = async () => {
    const response = await api.get("/pgs");
    return response.data;
};

export const getMyPGById = async (id) => {
    const response = await api.get(`/pgs/${id}`);
    return response.data;
};

export const createPG = async (pgData) => {
    const response = await api.post("/pgs", pgData);
    return response.data;
};

export const updatePG = async (id, pgData) => {
    const response = await api.put(`/pgs/${id}`, pgData);
    return response.data;
};

export const deletePG = async (id) => {
    const response = await api.delete(`/pgs/${id}`);
    return response.data;
};