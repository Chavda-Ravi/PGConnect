const { v2: cloudinary } = require("cloudinary");

const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary client initialized");
} else {
    console.warn(
        "Cloudinary env vars missing — image uploads will be disabled",
    );
}

module.exports = hasCloudinary ? cloudinary : null;