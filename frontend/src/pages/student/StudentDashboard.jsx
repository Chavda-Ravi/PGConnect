import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getStudentBookings } from "../../services/bookingService";
import { getMyInquiries } from "../../services/inquiryService";
import { getMyFavorites } from "../../services/favoriteService";
import { getMyReviews } from "../../services/reviewService";
import "../../index.css";

function StudentDashboard() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [bookings, setBookings] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");

            const safe = async (fn, fallback = []) => {
                try {
                    return await fn();
                } catch {
                    return fallback;
                }
            };

            const [b, i, f, r] = await Promise.all([
                safe(getStudentBookings, { bookings: [] }),
                safe(getMyInquiries, { inquiries: [] }),
                safe(getMyFavorites, { favorites: [] }),
                safe(getMyReviews, { reviews: [] }),
            ]);

            if (cancelled) return;

            setBookings(
                Array.isArray(b) ? b : b.bookings || b.data || [],
            );
            setInquiries(
                Array.isArray(i) ? i : i.inquiries || i.data || [],
            );
            setFavorites(
                Array.isArray(f) ? f : f.favorites || f.data || [],
            );
            setReviews(
                Array.isArray(r) ? r : r.reviews || r.data || [],
            );

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

    const answeredInquiries = inquiries.filter(
        (i) => i.status === "answered",
    ).length;

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading dashboard…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>Hi, {user?.name || "there"} 👋</h1>
                    <p>
                        Here is a quick overview of your PGConnect activity.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {/* Stat cards */}
                <div className="dash-grid">
                    <Link
                        to="/student/bookings"
                        className="dash-card"
                    >
                        <span className="dash-card-label">Bookings</span>
                        <span className="dash-card-value">
                            {bookings.length}
                        </span>
                        <span className="dash-card-hint">
                            {pendingBookings > 0
                                ? `${pendingBookings} pending`
                                : "No pending"}
                        </span>
                    </Link>

                    <Link
                        to="/student/inquiries"
                        className="dash-card"
                    >
                        <span className="dash-card-label">Inquiries</span>
                        <span className="dash-card-value">
                            {inquiries.length}
                        </span>
                        <span className="dash-card-hint">
                            {answeredInquiries > 0
                                ? `${answeredInquiries} answered`
                                : "Awaiting replies"}
                        </span>
                    </Link>

                    <Link
                        to="/student/favorites"
                        className="dash-card"
                    >
                        <span className="dash-card-label">Favorites</span>
                        <span className="dash-card-value">
                            {favorites.length}
                        </span>
                        <span className="dash-card-hint">
                            Saved PGs
                        </span>
                    </Link>

                    <Link
                        to="/student/reviews"
                        className="dash-card"
                    >
                        <span className="dash-card-label">Reviews</span>
                        <span className="dash-card-value">
                            {reviews.length}
                        </span>
                        <span className="dash-card-hint">
                            Written by you
                        </span>
                    </Link>
                </div>

                {/* Recent bookings */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Recent bookings</h2>
                        <Link to="/student/bookings">View all →</Link>
                    </div>

                    {bookings.length === 0 ? (
                        <p className="pgd-muted">
                            No booking requests yet.{" "}
                            <Link to="/student/search">
                                Find a PG
                            </Link>
                            .
                        </p>
                    ) : (
                        <ul className="dash-list">
                            {bookings.slice(0, 3).map((b) => (
                                <li key={b._id} className="dash-list-item">
                                    <div>
                                        <span className="dash-list-title">
                                            {b.pgId?.pgName || "PG removed"}
                                        </span>
                                        {b.pgId && (
                                            <span className="dash-list-sub">
                                                {b.pgId.city}
                                                {b.pgId.state
                                                    ? `, ${b.pgId.state}`
                                                    : ""}
                                            </span>
                                        )}
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
                        <Link to="/student/inquiries">View all →</Link>
                    </div>

                    {inquiries.length === 0 ? (
                        <p className="pgd-muted">
                            No inquiries yet. Open a PG to send one.
                        </p>
                    ) : (
                        <ul className="dash-list">
                            {inquiries.slice(0, 3).map((i) => (
                                <li key={i._id} className="dash-list-item">
                                    <div>
                                        <span className="dash-list-title">
                                            {i.pgId?.pgName || "PG removed"}
                                        </span>
                                        {i.pgId && (
                                            <span className="dash-list-sub">
                                                {i.pgId.city}
                                                {i.pgId.state
                                                    ? `, ${i.pgId.state}`
                                                    : ""}
                                            </span>
                                        )}
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

                {/* Quick actions */}
                <section className="dash-section">
                    <div className="dash-section-head">
                        <h2>Quick actions</h2>
                    </div>

                    <div className="dash-actions">
                        <Link
                            className="owner-primary-cta"
                            to="/student/search"
                        >
                            Search PGs
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/student/favorites"
                        >
                            My Favorites
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/student/bookings"
                        >
                            My Bookings
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/student/inquiries"
                        >
                            My Inquiries
                        </Link>
                        <Link
                            className="home-cta ghost"
                            to="/student/reviews"
                        >
                            My Reviews
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StudentDashboard;