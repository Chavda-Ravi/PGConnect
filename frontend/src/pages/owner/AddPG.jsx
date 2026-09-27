import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPG } from "../../services/pgService";
import "../../index.css";

function AddPG() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        pgName: "",
        address: "",
        city: "",
        state: "",
        description: "",
        contactNo: "",
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            await createPG(formData);
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
        <main className="owner-page">
            <div className="owner-inner">
                <Link className="owner-back" to="/owner/pgs">
                    ← Back to my PGs
                </Link>

                <header className="owner-header">
                    <p className="owner-kicker">New listing</p>
                    <h1>Add a PG</h1>
                    <p>Fill in the details below to publish a new PG listing.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                <form className="owner-form" onSubmit={handleSubmit}>
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

                    <label className="field">
                        <span>Description</span>
                        <input
                            type="text"
                            name="description"
                            placeholder="Short description of the PG"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </label>

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

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Creating…" : "Create PG"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default AddPG;