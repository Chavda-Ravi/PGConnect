import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPGs, getPGById } from "../../services/pgService";
import { getReviewsByPG } from "../../services/reviewService";
import "../../index.css";

function Reviews() {
    const [items, setItems] = useState([]); // { pg, reviews }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const pgData = await getMyPGs();
                const pgs = Array.isArray(pgData)
                    ? pgData
                    : pgData.pgListings || pgData.pgs || pgData.data || [];

                // For each PG, fetch its reviews (parallel)
                const results = await Promise.all(
                    pgs.map(async (pg) => {
                        try {
                            const rv = await getReviewsByPG(pg._id);
                            const list = Array.isArray(rv)
                                ? rv
                                : rv.reviews || [];
                            const avg =
                                list.length > 0
                                    ? (
                                          list.reduce(
                                              (s, r) => s + (r.rating || 0),
                                              0,
                                          ) / list.length
                                      ).toFixed(1)
                                    : null;
                            return { pg, reviews: list, avg };
                        } catch {
                            return { pg, reviews: [], avg: null };
                        }
                    }),
                );

                setItems(results);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Could not load reviews.",
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading reviews…</div>
                </div>
            </main>
        );
    }

    const totalReviews = items.reduce(
        (sum, it) => sum + it.reviews.length,
        0,
    );

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Owner</p>
                    <h1>Reviews</h1>
                    <p>
                        What students are saying about your PG listings.
                        {totalReviews > 0
                            ? ` ${totalReviews} total review${
                                  totalReviews > 1 ? "s" : ""
                              }.`
                            : ""}
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {items.length === 0 && (
                    <div className="owner-empty">
                        <p>You haven&apos;t published any PG yet.</p>
                        <Link className="owner-primary-cta" to="/owner/pgs/add">
                            Add a PG
                        </Link>
                    </div>
                )}

                {items.map(({ pg, reviews, avg }) => (
                    <section key={pg._id} className="pgd-card" style={{ marginBottom: "18px" }}>
                        <div className="owner-header-row">
                            <div>
                                <h2 style={{ margin: 0 }}>
                                    {pg.pgName}
                                </h2>
                                <p className="pgd-muted" style={{ marginTop: 4 }}>
                                    {pg.city}
                                    {pg.state ? `, ${pg.state}` : ""}
                                </p>
                            </div>

                            {avg && (
                                <div className="pgd-rating">
                                    <span className="pgd-rating-value">
                                        {avg}
                                    </span>
                                    <span className="pgd-rating-label">
                                        {reviews.length} review
                                        {reviews.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <p className="pgd-muted" style={{ marginTop: 12 }}>
                                No reviews yet.
                            </p>
                        ) : (
                            <ul className="pgd-review-list" style={{ marginTop: 16 }}>
                                {reviews.map((r) => (
                                    <li
                                        key={r._id}
                                        className="pgd-review"
                                    >
                                        <div className="pgd-review-head">
                                            <span className="pgd-review-stars">
                                                {"★".repeat(r.rating || 0)}
                                                {"☆".repeat(
                                                    5 - (r.rating || 0),
                                                )}
                                            </span>
                                            <span className="pgd-review-date">
                                                {r.studentId?.name
                                                    ? `by ${r.studentId.name} · `
                                                    : ""}
                                                {r.createdAt
                                                    ? new Date(
                                                          r.createdAt,
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </span>
                                        </div>
                                        {r.comment && (
                                            <p className="pgd-review-comment">
                                                {r.comment}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </main>
    );
}

export default Reviews;