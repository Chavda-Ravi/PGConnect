import { useEffect, useState } from "react";
import {
    createOwnerProfile,
    getOwnerProfile,
    updateOwnerProfile,
} from "../../services/pgOwnerService";
import "../../index.css";

function OwnerProfile() {
    const [formData, setFormData] = useState({
        ownerName: "",
        contactNo: "",
        city: "",
        state: "",
    });

    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getOwnerProfile();
                const profile = data.pgOwner || data.profile || data.data || data;

                if (profile && profile._id) {
                    setFormData({
                        ownerName: profile.ownerName || "",
                        contactNo: profile.contactNo || "",
                        city: profile.city || "",
                        state: profile.state || "",
                    });
                    setExists(true);
                }
            } catch (err) {
                // 404 = no profile yet → keep create mode (not an error)
                if (err.response && err.response.status !== 404) {
                    setError(
                        err.response.data?.message ||
                            "Could not load your profile.",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

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
            if (exists) {
                await updateOwnerProfile(formData);
                setSuccess("Profile updated.");
            } else {
                await createOwnerProfile(formData);
                setExists(true);
                setSuccess("Profile created. You can now add PG listings.");
            }
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message || "Could not save your profile.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading profile…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Owner</p>
                    <h1>
                        {exists ? "Edit your profile" : "Create your profile"}
                    </h1>
                    <p>
                        This is your public owner profile. It is required
                        before you can publish PG listings.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}
                {success && <div className="auth-alert success">{success}</div>}

                <form className="owner-form" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Owner name</span>
                        <input
                            type="text"
                            name="ownerName"
                            placeholder="e.g. Ronak Patel"
                            value={formData.ownerName}
                            onChange={handleChange}
                            required
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

                    <label className="field">
                        <span>City</span>
                        <input
                            type="text"
                            name="city"
                            placeholder="e.g. Ahmedabad"
                            value={formData.city}
                            onChange={handleChange}
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
                        />
                    </label>

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving…"
                            : exists
                              ? "Save changes"
                              : "Create profile"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default OwnerProfile;