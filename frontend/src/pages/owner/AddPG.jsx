import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PGForm from "../../components/PGForm";
import { createPG } from "../../services/pgService";
import "../../index.css";

function AddPG() {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (formData, images) => {
        setError("");
        setSaving(true);

        try {
            await createPG({ ...formData, images });
            navigate("/owner/pgs");
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Could not create PG. Make sure your owner profile exists.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="create-page">
            <div className="create-inner">
                <Link className="owner-back" to="/owner/pgs">
                    ← Back to my PGs
                </Link>

                <header className="create-header">
                    <div>
                        <p className="owner-kicker">New listing</p>
                        <h1>Add a PG</h1>
                        <p className="create-subtitle">
                            Publish a new PG listing. Add photos and details
                            — you can edit everything later.
                        </p>
                    </div>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                <PGForm
                    mode="create"
                    onSubmit={handleSubmit}
                    submitting={saving}
                    backTo="/owner/pgs"
                />
            </div>
        </main>
    );
}

export default AddPG;