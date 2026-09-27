import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMyPGById, updatePG, deletePG } from "../../services/pgService";
import "../../index.css";

function EditPG() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        pgName: "",
        address: "",
        city: "",
        state: "",
        description: "",
        contactNo: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getMyPGById(id);
                const pg = data.pgListing || data.pg || data.data || data;

                setFormData({
                    pgName: pg.pgName || "",
                    address: pg.address || "",
                    city: pg.city || "",
                    state: pg.state || "",
                    description: pg.description || "",
                    contactNo: pg.contactNo || "",
                });
            } catch (err) {
                if (!err.response) {
                    setError(
                        "Backend is not responding. Please restart the server and try again.",
                    );
                } else if (err.response.status === 404) {
                    setError("This PG listing could not be found.");
                } else if (err.response.status === 403) {
                    setError("You can only edit your own PG listings.");
                } else {
                    setError(
                        err.response.data?.message ||
                            "Could not load PG details.",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            await updatePG(id, formData);
            setSuccess("PG updated successfully.");
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message || "Could not update PG.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Delete this PG listing? This cannot be undone.",
        );

        if (!confirmed) return;

        setError("");
        setDeleting(true);

        try {
            await deletePG(id);
            navigate("/owner/pgs");
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message || "Could not delete PG.",
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading PG…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <Link className="owner-back" to="/owner/pgs">
                    ← Back to my PGs
                </Link>

                <header className="owner-header">
                    <p className="owner-kicker">Edit listing</p>
                    <h1>Edit PG</h1>
                    <p>Update the details of your PG listing.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}
                {success && <div className="auth-alert success">{success}</div>}

                {!error || !error.startsWith("This PG") ? (
                    <form className="owner-form" onSubmit={handleSubmit}>
                        <label className="field">
                            <span>PG name</span>
                            <input
                                type="text"
                                name="pgName"
                                value={formData.pgName}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Address</span>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>City</span>
                            <input
                                type="text"
                                name="city"
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
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Description</span>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="field">
                            <span>Contact number</span>
                            <input
                                type="tel"
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <div className="owner-form-actions">
                            <button
                                className="auth-button"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save changes"}
                            </button>

                            <button
                                type="button"
                                className="owner-danger-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting…" : "Delete PG"}
                            </button>
                        </div>
                    </form>
                ) : null}
            </div>
        </main>
    );
}

export default EditPG;