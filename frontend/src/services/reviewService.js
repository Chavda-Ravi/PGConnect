import api from "./api";

// Public/student: get all reviews for a PG
export const getReviewsByPG = async (pgId) => {
    const response = await api.get(`/reviews/pg/${pgId}`);
    return response.data;
};

// Student: get own reviews
export const getMyReviews = async () => {
    const response = await api.get("/reviews/my");
    return response.data;
};

// Student: create a review (requires accepted booking)
export const createReview = async ({ pgId, bookingId, rating, comment }) => {
    const response = await api.post("/reviews", {
        pgId,
        bookingId,
        rating,
        comment,
    });
    return response.data;
};

// Student: update own review
export const updateReview = async (id, { rating, comment }) => {
    const response = await api.put(`/reviews/${id}`, { rating, comment });
    return response.data;
};

// Student: delete own review
export const deleteReview = async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
};