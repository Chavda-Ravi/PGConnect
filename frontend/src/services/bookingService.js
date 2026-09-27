import api from "./api";

// Student: request a booking for a PG
export const createBooking = async ({ pgId, startDate, duration, message }) => {
    const response = await api.post("/bookings", {
        pgId,
        startDate,
        duration,
        message,
    });
    return response.data;
};

// Student: get own bookings
export const getStudentBookings = async () => {
    const response = await api.get("/bookings/student");
    return response.data;
};

// Owner: get bookings for own PGs
export const getOwnerBookings = async () => {
    const response = await api.get("/bookings/owner");
    return response.data;
};

// Owner: accept a booking
export const acceptBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/accept`);
    return response.data;
};

// Owner: reject a booking
export const rejectBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/reject`);
    return response.data;
};

// Student: cancel own pending booking
export const cancelBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
};