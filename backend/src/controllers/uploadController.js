const cloudinary = require("../config/cloudinary");

const uploadPGImage = async (req, res) => {
    try {
        if (!cloudinary) {
            return res.status(503).json({
                message:
                    "Image upload is not configured. Contact the administrator.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message:
                    "No file uploaded. Send the image as form field 'image'.",
            });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "pgconnect/pgs",
                    resource_type: "image",
                    transformation: [
                        { quality: "auto", fetch_format: "auto" },
                        {
                            width: 1200,
                            height: 900,
                            crop: "fill",
                            gravity: "auto",
                        },
                    ],
                },
                (error, uploaded) => {
                    if (error) reject(error);
                    else resolve(uploaded);
                },
            );

            stream.end(req.file.buffer);
        });

        res.status(200).json({
            message: "Image uploaded successfully",
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error("Upload Image Error:", error.message);

        res.status(500).json({
            message: "Image upload failed",
            error: error.message,
        });
    }
};

module.exports = {
    uploadPGImage,
};