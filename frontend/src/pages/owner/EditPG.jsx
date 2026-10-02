import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PGForm from "../../components/PGForm";
import { getMyPGById, updatePG, deletePG } from "../../services/pgService";
import "../../index.css";

function EditPG() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loadedValues, setLoadedValues] = useState(null);
    const [loadedImages, setLoadedImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fatalError, setFatalError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setFatalError("");

            try {
                const data = await getMyPGById(id);
                const pg = data.pgListing || data.pg || data.data || data;

                setLoadedValues({
                    pgName: pg.pgName || "",
                    address: pg.address || "",
                    city: pg.city || "",
                    state: pg.state || "",
                    description: pg.description || "",
                    contactNo: pg.contactNo || "",
                });

                setLoadedImages(Array.isArray(pg.images) ? pg.images : []);
            } catch (err) {
                if (!err.response) {
                    setFatalError(
                        "Backend is not responding. Please restart the server and try again.",
                    );
                } else if (err.response.status === 404) {
                    setFatalError("This PG listing could not be found.");
                } else if (err.response.status === 403) {
                    setFatalError("You can only edit your own PG listings.");
                } else {
                    setFatalError(
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

    const handleSubmit = async (formData, images) => {
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            await updatePG(id, { ...formData, images });
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
            <main className="create-page">
                <div className="create-inner">
                    <div className="owner-loading">Loading PG…</div>
                </div>
            </main>
        );
    }

    if (fatalError) {
        return (
            <main className="create-page">
                <div className="create-inner">
                    <Link className="owner-back" to="/owner/pgs">
                        ← Back to my PGs
                    </Link>
                    <div className="auth-alert error" style={{ marginTop: 16 }}>
                        {fatalError}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="create-page">
            <div className="create-inner">
                <Link className="owner-back" to="/owner/pgs">
                    ← Back to my PGs
                </Link>

                <header className="create-header">
                    <div>
                        <p className="owner-kicker">Edit listing</p>
                        <h1>Edit PG</h1>
                        <p className="create-subtitle">
                            Update the details of your PG listing.
                        </p>
                    </div>
                </header>

                {error && <div className="auth-alert error">{error}</div>}
                {success && (
                    <div className="auth-alert success">{success}</div>
                )}

                <PGForm
                    mode="edit"
                    initialValues={loadedValues}
                    initialImages={loadedImages}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    submitting={saving}
                    deleting={deleting}
                    backTo="/owner/pgs"
                />
            </div>
        </main>
    );
}

export default EditPG;