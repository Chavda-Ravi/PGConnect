import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getStudentBookings,
    cancelBooking,
} from "../../services/bookingService";
import "../../index.css";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actingId, setActingId] = useState(null);
    const [rowError, setRowError] = useState({});

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getStudentBookings();
            const list = Array.isArray(data)
                ? data
                : data.bookings || data.data || [];
            setBookings(list);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Could not load your bookings.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCancel = async (bookingId) => {
        const confirmed = window.confirm(
            "Cancel this pending booking request?",
        );
        if (!confirmed) return;

        setActingId(bookingId);
        setRowError((prev) => ({ ...prev, [bookingId]: "" }));

        try {
            const data = await cancelBooking(bookingId);
            const updated = data.booking || data;
            setBookings((prev) =>
                prev.map((b) =>
                    b._id === bookingId ? { ...b, ...updated } : b,
                ),
            );
        } catch (err) {
            setRowError((prev) => ({
                ...prev,
                [bookingId]:
                    err.response?.data?.message ||
                    "Could not cancel this booking.",
            }));
        } finally {
            setActingId(null);
        }
    };

    const statusClass = (status) => `status-pill status-${status}`;

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading bookings…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>My Bookings</h1>
                    <p>
                        Track the booking requests you have sent and their
                        status.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {bookings.some((b) => b.status === "accepted") && (
                    <div className="auth-alert success">
                        You have an accepted booking. You cannot request another PG
                        until that booking is cancelled.
                    </div>
                )}


                {bookings.length === 0 ? (
                    <div className="owner-empty">
                        <p>You haven&apos;t requested any bookings yet.</p>
                        <Link className="owner-primary-cta" to="/student/search">
                            Browse PGs
                        </Link>
                    </div>
                ) : (
                    <div className="inquiry-list">
                        {bookings.map((b) => (
                            <article key={b._id} className="inquiry-item">
                                <header className="inquiry-item-head">
                                    <div>
                                        <h3>
                                            {b.pgId?.pgName || "PG removed"}
                                        </h3>
                                        {b.pgId && (
                                            <p className="inquiry-item-loc">
                                                {b.pgId.city}
                                                {b.pgId.state
                                                    ? `, ${b.pgId.state}`
                                                    : ""}
                                            </p>
                                        )}
                                    </div>

                                    <span className={statusClass(b.status)}>
                                        {b.status}
                                    </span>
                                </header>

                                <div className="booking-meta">
                                    <div>
                                        <span className="booking-meta-label">
                                            Start date
                                        </span>
                                        <span className="booking-meta-value">
                                            {new Date(
                                                b.startDate,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="booking-meta-label">
                                            Duration
                                        </span>
                                        <span className="booking-meta-value">
                                            {b.duration} month
                                            {b.duration > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                {b.message && (
                                    <>
                                        <p className="inquiry-item-label">
                                            Your message
                                        </p>
                                        <p className="inquiry-item-body">
                                            {b.message}
                                        </p>
                                    </>
                                )}

                                {(b.status === "pending" || b.status === "accepted") && (
                                    <div className="owner-form-actions">
                                        <button
                                            type="button"
                                            className="owner-danger-button"
                                            onClick={() => handleCancel(b._id)}
                                            disabled={actingId === b._id}
                                        >
                                            {actingId === b._id
                                                ? "Cancelling…"
                                                : "Cancel request"}
                                        </button>
                                    </div>
                                )}

                                {rowError[b._id] && (
                                    <div className="auth-alert error">
                                        {rowError[b._id]}
                                    </div>
                                )}

                                <p className="inquiry-item-date">
                                    Requested{" "}
                                    {new Date(
                                        b.createdAt,
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

export default MyBookings;