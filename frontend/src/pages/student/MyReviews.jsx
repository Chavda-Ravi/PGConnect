import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    deleteReview,
    getMyReviews,
    updateReview,
} from "../../services/reviewService";
import "../../index.css";

function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
    const [busy, setBusy] = useState(null); // { id, action } or null

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getMyReviews();
            const list = Array.isArray(data)
                ? data
                : data.reviews || data.data || [];
            setReviews(list);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load your reviews.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const startEdit = (review) => {
        setEditingId(review._id);
        setEditForm({
            rating: review.rating,
            comment: review.comment || "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ rating: 5, comment: "" });
    };

    const handleUpdate = async (reviewId) => {
        setBusy({ id: reviewId, action: "update" });

        try {
            const data = await updateReview(reviewId, editForm);
            const updated = data.review || data;
            setReviews((prev) =>
                prev.map((r) =>
                    r._id === reviewId ? { ...r, ...updated } : r,
                ),
            );
            cancelEdit();
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not update review.",
            );
        } finally {
            setBusy(null);
        }
    };

    const handleDelete = async (reviewId) => {
        const confirmed = window.confirm(
            "Delete this review? This cannot be undone.",
        );
        if (!confirmed) return;

        setBusy({ id: reviewId, action: "delete" });

        try {
            await deleteReview(reviewId);
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not delete review.",
            );
        } finally {
            setBusy(null);
        }
    };

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading reviews…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>My Reviews</h1>
                    <p>Reviews you have written about PGs you stayed at.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {reviews.length === 0 ? (
                    <div className="owner-empty">
                        <p>You haven&apos;t written any reviews yet.</p>
                        <Link className="owner-primary-cta" to="/student/bookings">
                            My Bookings
                        </Link>
                    </div>
                ) : (
                    <div className="inquiry-list">
                        {reviews.map((r) => (
                            <article key={r._id} className="inquiry-item">
                                <header className="inquiry-item-head">
                                    <div>
                                        <h3>
                                            {r.pgId?.pgName || "PG removed"}
                                        </h3>
                                        {r.pgId && (
                                            <p className="inquiry-item-loc">
                                                {r.pgId.city}
                                                {r.pgId.state
                                                    ? `, ${r.pgId.state}`
                                                    : ""}
                                            </p>
                                        )}
                                    </div>

                                    <span className="pgd-review-stars">
                                        {"★".repeat(r.rating || 0)}
                                        {"☆".repeat(5 - (r.rating || 0))}
                                    </span>
                                </header>

                                {editingId === r._id ? (
                                    <div className="review-form">
                                        <label className="field">
                                            <span>Rating</span>
                                            <select
                                                value={editForm.rating}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        rating: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            >
                                                <option value={5}>★★★★★ (5)</option>
                                                <option value={4}>★★★★ (4)</option>
                                                <option value={3}>★★★ (3)</option>
                                                <option value={2}>★★ (2)</option>
                                                <option value={1}>★ (1)</option>
                                            </select>
                                        </label>

                                        <label className="field">
                                            <span>Comment</span>
                                            <textarea
                                                rows="3"
                                                value={editForm.comment}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        comment: e.target.value,
                                                    })
                                                }
                                            />
                                        </label>

                                        <div className="owner-form-actions">
                                            <button
                                                type="button"
                                                className="auth-button"
                                                onClick={() =>
                                                    handleUpdate(r._id)
                                                }
                                                disabled={
                                                    busy?.id === r._id &&
                                                    busy.action === "update"
                                                }
                                            >
                                                {busy?.id === r._id &&
                                                busy.action === "update"
                                                    ? "Saving…"
                                                    : "Save"}
                                            </button>

                                            <button
                                                type="button"
                                                className="owner-danger-button"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {r.comment && (
                                            <p className="inquiry-item-body">
                                                {r.comment}
                                            </p>
                                        )}

                                        <div className="owner-form-actions">
                                            <button
                                                type="button"
                                                className="pg-card-link"
                                                onClick={() => startEdit(r)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="pg-card-link pg-card-remove"
                                                onClick={() =>
                                                    handleDelete(r._id)
                                                }
                                                disabled={
                                                    busy?.id === r._id &&
                                                    busy.action === "delete"
                                                }
                                            >
                                                {busy?.id === r._id &&
                                                busy.action === "delete"
                                                    ? "Deleting…"
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                <p className="inquiry-item-date">
                                    Reviewed{" "}
                                    {new Date(
                                        r.createdAt,
                                    ).toLocaleDateString()}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default MyReviews;