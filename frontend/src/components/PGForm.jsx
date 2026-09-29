import { useState } from "react";
import { Link } from "react-router-dom";
import { uploadPGImage } from "../services/uploadService";
import "../index.css";

const MAX_IMAGES = 5;

function PGForm({
    mode = "create",          // "create" | "edit"
    initialValues,
    initialImages = [],
    onSubmit,
    onDelete,                 // optional — shows Delete button when provided
    submitting = false,
    deleting = false,
    error = "",
    success = "",
    backTo = "/owner/pgs",
}) {
    const emptyValues = {
        pgName: "",
        address: "",
        city: "",
        state: "",
        description: "",
        contactNo: "",
    };

    const [formData, setFormData] = useState({
        ...emptyValues,
        ...(initialValues || {}),
    });

    const [images, setImages] = useState(initialImages);

    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState("");

    const isEdit = mode === "edit";

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleImageSelect = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setImageError("");

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            setImageError(`You can upload up to ${MAX_IMAGES} images.`);
            event.target.value = "";
            return;
        }

        const toUpload = files.slice(0, remaining);
        setUploading(true);

        try {
            const uploadedUrls = [];

            for (const file of toUpload) {
                if (file.size > 5 * 1024 * 1024) {
                    setImageError(
                        `"${file.name}" is larger than 5 MB. Please compress it first.`,
                    );
                    continue;
                }

                const data = await uploadPGImage(file);
                if (data.url) uploadedUrls.push(data.url);
            }

            setImages((prev) => [...prev, ...uploadedUrls]);
        } catch (err) {
            setImageError(
                err.response?.data?.message ||
                    "Could not upload image. Please try again.",
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const handleRemoveImage = (url) => {
        setImages((prev) => prev.filter((u) => u !== url));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (uploading) return;

        await onSubmit(formData, images);
    };

    return (
        <form className="create-layout" onSubmit={handleSubmit}>
            {/* LEFT: form sections */}
            <div className="create-left">
                <section className="create-card">
                    <div className="create-card-head">
                        <h2>Basic details</h2>
                        <p>Give your PG a clear, searchable name.</p>
                    </div>

                    <label className="field">
                        <span>PG name</span>
                        <input
                            type="text"
                            name="pgName"
                            placeholder="e.g. Sunrise Boys PG"
                            value={formData.pgName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </section>

                <section className="create-card">
                    <div className="create-card-head">
                        <h2>Location</h2>
                        <p>
                            Students search by state and city. Both are
                            required.
                        </p>
                    </div>

                    <label className="field">
                        <span>Address</span>
                        <input
                            type="text"
                            name="address"
                            placeholder="e.g. 21, Ashram Road"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <div className="create-row">
                        <label className="field">
                            <span>City</span>
                            <input
                                type="text"
                                name="city"
                                placeholder="e.g. Ahmedabad"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>State</span>
                            <input
                                type="text"
                                name="state"
                                placeholder="e.g. Gujarat"
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                </section>

                <section className="create-card">
                    <div className="create-card-head">
                        <h2>Contact & description</h2>
                        <p>
                            How students reach you and what makes this PG
                            stand out.
                        </p>
                    </div>

                    <label className="field">
                        <span>Contact number</span>
                        <input
                            type="tel"
                            name="contactNo"
                            placeholder="e.g. 9876543210"
                            value={formData.contactNo}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Description</span>
                        <textarea
                            name="description"
                            rows="5"
                            placeholder="Describe the rooms, locality, nearby colleges, house rules…"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </label>
                </section>
            </div>

            {/* RIGHT: images + preview */}
            <aside className="create-right">
                <section className="create-card">
                    <div className="create-card-head">
                        <h2>Photos</h2>
                        <p>
                            Up to {MAX_IMAGES} images. First one is the cover.
                        </p>
                    </div>

                    {imageError && (
                        <div className="auth-alert error">{imageError}</div>
                    )}

                    {images.length > 0 && (
                        <div className="image-preview-grid">
                            {images.map((url, index) => (
                                <div
                                    key={url}
                                    className="image-preview-item"
                                >
                                    <img src={url} alt={`PG ${index + 1}`} />
                                    {index === 0 && (
                                        <span className="image-cover-tag">
                                            Cover
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        className="image-remove-btn"
                                        onClick={() =>
                                            handleRemoveImage(url)
                                        }
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {images.length < MAX_IMAGES && (
                        <label className="image-drop">
                            <span className="image-drop-icon">+</span>
                            <span className="image-drop-title">
                                {uploading ? "Uploading…" : "Add photos"}
                            </span>
                            <span className="image-drop-hint">
                                Click to browse · JPEG/PNG/WebP · max 5 MB
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageSelect}
                                disabled={uploading}
                                hidden
                            />
                        </label>
                    )}
                </section>

                <section className="create-card create-card-preview">
                    <div className="create-card-head">
                        <h2>Preview</h2>
                        <p>How students will see the cover card.</p>
                    </div>

                    <div className="preview-card">
                        <div className="preview-card-image">
                            {images[0] ? (
                                <img src={images[0]} alt="Preview" />
                            ) : (
                                <div className="preview-card-placeholder">
                                    No cover photo yet
                                </div>
                            )}
                        </div>

                        <div className="preview-card-body">
                            <h3>{formData.pgName || "Your PG name"}</h3>
                            <p className="preview-card-loc">
                                {formData.city || "City"}
                                {formData.state
                                    ? `, ${formData.state}`
                                    : ", State"}
                            </p>
                            <p className="preview-card-desc">
                                {formData.description ||
                                    "Short description will appear here."}
                            </p>
                        </div>
                    </div>
                </section>
            </aside>

            {/* FOOTER bar */}
            <div className="create-footer">
                <Link className="create-cancel" to={backTo}>
                    Cancel
                </Link>

                {isEdit && onDelete && (
                    <button
                        type="button"
                        className="owner-danger-button"
                        onClick={onDelete}
                        disabled={deleting}
                        style={{ marginRight: "auto" }}
                    >
                        {deleting ? "Deleting…" : "Delete PG"}
                    </button>
                )}

                <button
                    className="create-submit"
                    type="submit"
                    disabled={submitting || uploading}
                >
                    {submitting
                        ? isEdit
                            ? "Saving…"
                            : "Creating…"
                        : uploading
                          ? "Uploading images…"
                          : isEdit
                            ? "Save changes"
                            : "Create PG"}
                </button>
            </div>
        </form>
    );
}

export default PGForm;