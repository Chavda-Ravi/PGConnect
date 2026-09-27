import api from "./api";

// Student: add PG to favorites
export const addFavorite = async (pgId) => {
    const response = await api.post(`/favorites/${pgId}`);
    return response.data;
};

// Student: remove PG from favorites
export const removeFavorite = async (pgId) => {
    const response = await api.delete(`/favorites/${pgId}`);
    return response.data;
};

// Student: get all favorites
export const getMyFavorites = async () => {
    const response = await api.get("/favorites");
    return response.data;
};

// Student: check if a PG is favorited
export const checkFavorite = async (pgId) => {
    const response = await api.get(`/favorites/${pgId}`);
    return response.data;
};