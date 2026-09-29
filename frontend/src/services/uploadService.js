import api from "./api";

// Upload a single image to the backend, which forwards to Cloudinary.
// Returns { url, publicId }.
export const uploadPGImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/uploads/pg-image", formData, {
        headers: {
            // Don't set Content-Type manually — axios sets it automatically
            // with the correct multipart boundary. If you hardcode it,
            // the boundary is missing and multer rejects the file.
        },
        timeout: 30000, // 30s — image uploads can be slow on mobile networks
    });

    return response.data;
};