import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMyPGs } from "../../services/pgService";
import {
    createAvailability,
    deleteAvailability,
    getAvailabilityByPG,
    updateAvailability,
} from "../../services/availabilityService";
import "../../index.css";

function Availability() {
    const [searchParams] = useSearchParams();
    const pgId = searchParams.get("pgId") || "";

    const [pg, setPG] = useState(null);
    const [loadingPG, setLoadingPG] = useState(true);

    const [availability, setAvailability] = useState(null);
    const [loadingAvail, setLoadingAvail] = useState(false);

    const [formData, setFormData] = useState({
        totalBeds: "",
        availableBeds: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* Load just the selected PG's header info */
    useEffect(() => {
        if (!pgId) {
            setLoadingPG(false);
            setError("No PG selected. Open this page from a PG card.");
            return;
        }

        const load = async () => {
            setLoadingPG(true);
            setError("");

            try {
                const data = await getMyPGs();
                const list = Array.isArray(data)
                    ? data
                    : data.pgListings || data.pgs || data.data || [];

                const found = list.find((p) => p._id === pgId) || null;

                if (!found) {
                    setError("This PG could not be found in your listings.");
                }

                setPG(found);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Could not load PG details.",
                );
            } finally {
                setLoadingPG(false);
            }
        };

        load();
    }, [pgId]);

    /* Load availability for the selected PG */
    useEffect(() => {
        if (!pgId) return;

        const load = async () => {
            setLoadingAvail(true);
            setError("");
            setSuccess("");

            try {
                const data = await getAvailabilityByPG(pgId);
                const resolved = data.availability || data.data || data;

                if (resolved && resolved._id) {
                    setAvailability(resolved);
                    setFormData({
                        totalBeds: resolved.totalBeds ?? "",
                        availableBeds: resolved.availableBeds ?? "",
                    });
                } else {
                    setAvailability(null);
                    setFormData({ totalBeds: "", availableBeds: "" });
                }
            } catch (err) {
                if (err.response && err.response.status !== 404) {
                    setError(
                        err.response.data?.message ||
                            "Could not load availability.",
                    );
                }
                setAvailability(null);
                setFormData({ totalBeds: "", availableBeds: "" });
            } finally {
                setLoadingAvail(false);
            }
        };

        load();
    }, [pgId]);

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

        const total = Number(formData.totalBeds);
        const available = Number(formData.availableBeds);

        if (Number.isNaN(total) || Number.isNaN(available)) {
            setError("Total beds and available beds must be numbers.");
            return;
        }

        if (total < 0 || available < 0) {
            setError("Beds cannot be negative.");
            return;
        }

        if (available > total) {
            setError("Available beds cannot be greater than total beds.");
            return;
        }

        setSaving(true);

        try {
            if (availability) {
                const data = await updateAvailability(availability._id, {
                    totalBeds: total,
                    availableBeds: available,
                });
                const resolved = data.availability || data.data || data;
                if (resolved && resolved._id) setAvailability(resolved);
                setSuccess("Availability updated.");
            } else {
                const data = await createAvailability({
                    pgId,
                    totalBeds: total,
                    availableBeds: available,
                });
                const resolved = data.availability || data.data || data;
                if (resolved && resolved._id) setAvailability(resolved);
                setSuccess("Availability created.");
            }
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Could not save availability.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!availability) return;

        const confirmed = window.confirm(
            "Delete availability for this PG? Students will no longer see bed counts.",
        );
        if (!confirmed) return;

        setError("");
        setSuccess("");
        setDeleting(true);

        try {
            await deleteAvailability(availability._id);
            setAvailability(null);
            setFormData({ totalBeds: "", availableBeds: "" });
            setSuccess("Availability deleted.");
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Could not delete availability.",
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loadingPG) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading…</div>
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
                    <p className="owner-kicker">Owner</p>
                    <h1>Availability</h1>
                    {pg ? (
                        <p>
                            Editing availability for{" "}
                            <strong>{pg.pgName}</strong>
                            {pg.city
                                ? ` (${pg.city}${
                                      pg.state ? `, ${pg.state}` : ""
                                  })`
                                : ""}
                            .
                        </p>
                    ) : (
                        <p>Set bed counts for this PG.</p>
                    )}
                </header>

                {error && <div className="auth-alert error">{error}</div>}
                {success && <div className="auth-alert success">{success}</div>}

                {pgId && !error && (
                    <section className="owner-form">
                        {loadingAvail ? (
                            <div className="owner-loading">
                                Loading availability…
                            </div>
                        ) : (
                            <form
                                className="availability-form"
                                onSubmit={handleSubmit}
                            >
                                <label className="field">
                                    <span>Total beds</span>
                                    <input
                                        type="number"
                                        name="totalBeds"
                                        min="0"
                                        placeholder="e.g. 20"
                                        value={formData.totalBeds}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label className="field">
                                    <span>Available beds</span>
                                    <input
                                        type="number"
                                        name="availableBeds"
                                        min="0"
                                        placeholder="e.g. 7"
                                        value={formData.availableBeds}
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
                                        {saving
                                            ? "Saving…"
                                            : availability
                                              ? "Save changes"
                                              : "Create availability"}
                                    </button>

                                    {availability && (
                                        <button
                                            type="button"
                                            className="owner-danger-button"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                        >
                                            {deleting
                                                ? "Deleting…"
                                                : "Delete availability"}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

export default Availability;