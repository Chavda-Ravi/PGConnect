import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyPGs } from "../../services/pgService";
import { getOwnerBookings } from "../../services/bookingService";
import { getOwnerInquiries } from "../../services/inquiryService";
import { getReviewsByPG } from "../../services/reviewService";
import "../../index.css";

function OwnerDashboard() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [pgs, setPGs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");

            const safe = async (fn, fallback) => {
                try {
                    return await fn();
                } catch {
                    return fallback;
                }
            };

            const [p, b, i] = await Promise.all([
                safe(getMyPGs, { pgListings: [] }),
                safe(getOwnerBookings, { bookings: [] }),
                safe(getOwnerInquiries, { inquiries: [] }),
            ]);

            if (cancelled) return;

            const pgList = Array.isArray(p)
                ? p
                : p.pgListings || p.pgs || p.data || [];
            const bookingList = Array.isArray(b)
                ? b
                : b.bookings || b.data || [];
            const inquiryList = Array.isArray(i)
                ? i
                : i.inquiries || i.data || [];

            setPGs(pgList);
            setBookings(bookingList);
            setInquiries(inquiryList);

            // Fetch reviews per PG (parallel, best-effort)
            const reviewResults = await Promise.all(
                pgList.map(async (pg) => {
                    try {
                        const rv = await getReviewsByPG(pg._id);
                        const list = Array.isArray(rv)
                            ? rv
                            : rv.reviews || [];
                        return list.map((r) => ({
                            ...r,
                            pgName: pg.pgName,
                        }));
                    } catch {
                        return [];
                    }
                }),
            );

            if (cancelled) return;

            const flat = reviewResults.flat();
            flat.sort((a, b) => {
                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return tb - ta;
            });
            setReviews(flat);

            setLoading(false);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const statusClass = (status) => `status-pill status-${status}`;

    const pendingBookings = bookings.filter(
        (b) => b.status === "pending",
    ).length;

    const openInquiries = inquiries.filter(
        (i) => i.status === "pending",
    ).length;

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading dashboard…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Owner</p>
                    <h1>Hi, {user?.name || "there"} 👋</h1>
                    <p>
                        Here is a quick overview of your PG listings and
                        activity.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {/* Stat cards */}
                <div className="dash-grid">
                    <Link to="/owner/pgs" className="dash-card">
                        <span className="dash-card-label">My PGs</span>
                        <span className="dash-card-value">
                            {pgs.length}
                        </span>
                        <span className="dash-card-hint">
                            Published listings
                        </span>
                    </Link>

                    <Link
                        to="/owner/bookings"
                        className="dash-card"
                    >
                        <span className="dash-card-label">
                            Pending bookings
                        </span>
                        <span className="dash-card-value">
                            {pendingBookings}
                        </span>
                        <span className="dash-card-hint">
                            {bookings.length} total
                        </span>
                    </Link>

                    <Link
                        to="/owner/inquiries"
                        className="dash-card"
                    >
                        <span className="dash-card-label">
                            Open inquiries
                        </span>
                        <span className="dash-card-value">
                            {openInquiries}
                        </span>
                        <span className="dash-card-hint">
                            {inquiries.length} total
                        </span>
                    </Link>

                    <Link
                        to="/owner/reviews"
                        className="dash-card"
                    >
                        <span className="dash-card-label">Reviews</span>
                        <span className="dash-card-value">
                            {reviews.length}
                        </span>
                        <span className="dash-card-hint">
                            Across your PGs
                        </span>
                    </Link>
                </div>

                {/* Recent bookings */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Recent bookings</h2>
                        <Link to="/owner/bookings">View all →</Link>
                    </div>

                    {bookings.length === 0 ? (
                        <p className="pgd-muted">
                            No booking requests yet.
                        </p>
                    ) : (
                        <ul className="dash-list">
                            {bookings.slice(0, 3).map((b) => (
                                <li key={b._id} className="dash-list-item">
                                    <div>
                                        <span className="dash-list-title">
                                            {b.pgId?.pgName || "PG removed"}
                                        </span>
                                        <span className="dash-list-sub">
                                            From:{" "}
                                            {b.studentId?.name ||
                                                "Student"}
                                            {b.pgId?.city
                                                ? ` · ${b.pgId.city}`
                                                : ""}
                                        </span>
                                    </div>
                                    <span
                                        className={statusClass(b.status)}
                                    >
                                        {b.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Recent inquiries */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Recent inquiries</h2>
                        <Link to="/owner/inquiries">View all →</Link>
                    </div>

                    {inquiries.length === 0 ? (
                        <p className="pgd-muted">No inquiries yet.</p>
                    ) : (
                        <ul className="dash-list">
                            {inquiries.slice(0, 3).map((i) => (
                                <li key={i._id} className="dash-list-item">
                                    <div>
                                        <span className="dash-list-title">
                                            {i.pgId?.pgName || "PG removed"}
                                        </span>
                                        <span className="dash-list-sub">
                                            From:{" "}
                                            {i.studentId?.name ||
                                                "Student"}
                                            {i.pgId?.city
                                                ? ` · ${i.pgId.city}`
                                                : ""}
                                        </span>
                                    </div>
                                    <span
                                        className={statusClass(i.status)}
                                    >
                                        {i.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Recent reviews */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Recent reviews</h2>
                        <Link to="/owner/reviews">View all →</Link>
                    </div>

                    {reviews.length === 0 ? (
                        <p className="pgd-muted">No reviews yet.</p>
                    ) : (
                        <ul className="dash-list">
                            {reviews.slice(0, 3).map((r) => (
                                <li key={r._id} className="dash-list-item">
                                    <div>
                                        <span className="dash-list-title">
                                            {r.pgName || "PG"}
                                        </span>
                                        <span className="dash-list-sub">
                                            {r.studentId?.name
                                                ? `by ${r.studentId.name}`
                                                : "Anonymous"}
                                            {r.comment
                                                ? ` · ${r.comment.slice(
                                                      0,
                                                      60,
                                                  )}${
                                                      r.comment.length > 60
                                                          ? "…"
                                                          : ""
                                                  }`
                                                : ""}
                                        </span>
                                    </div>
                                    <span className="pgd-review-stars">
                                        {"★".repeat(r.rating || 0)}
                                        {"☆".repeat(5 - (r.rating || 0))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Quick actions */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Quick actions</h2>
                    </div>

                    <div className="dash-actions">
                        <Link
                            className="owner-primary-cta"
                            to="/owner/pgs/add"
                        >
                            + Add PG
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/owner/pgs"
                        >
                            My PGs
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/owner/bookings"
                        >
                            Bookings
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/owner/inquiries"
                        >
                            Inquiries
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/owner/reviews"
                        >
                            Reviews
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/owner/profile"
                        >
                            Profile
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default OwnerDashboard;