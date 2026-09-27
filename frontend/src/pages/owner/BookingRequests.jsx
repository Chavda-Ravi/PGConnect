import { useEffect, useState } from "react";
import {
    acceptBooking,
    getOwnerBookings,
    rejectBooking,
} from "../../services/bookingService";
import "../../index.css";

function BookingRequests() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actingId, setActingId] = useState(null);
    const [rowError, setRowError] = useState({});

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getOwnerBookings();
            const list = Array.isArray(data)
                ? data
                : data.bookings || data.data || [];
            setBookings(list);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Could not load booking requests.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAction = async (bookingId, action) => {
        const verb = action === "accept" ? "accept" : "reject";
        const confirmed = window.confirm(
            `Are you sure you want to ${verb} this booking request?`,
        );
        if (!confirmed) return;

        setActingId(bookingId);
        setRowError((prev) => ({ ...prev, [bookingId]: "" }));

        try {
            const data =
                action === "accept"
                    ? await acceptBooking(bookingId)
                    : await rejectBooking(bookingId);

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
                    `Could not ${verb} this booking.`,
            }));
        } finally {
            setActingId(null);
        }
    };

    const statusClass = (status) => `status-pill status-${status}`;

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">
                        Loading booking requests…
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Owner</p>
                    <h1>Booking Requests</h1>
                    <p>
                        Review booking requests from students and accept or
                        reject them.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {bookings.length === 0 ? (
                    <div className="owner-empty">
                        <p>No booking requests yet.</p>
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
                                        <p className="inquiry-item-from">
                                            From:{" "}
                                            {b.studentId?.name ||
                                                "Student"}
                                            {b.studentId?.email
                                                ? ` (${b.studentId.email})`
                                                : ""}
                                            {b.studentId?.phone_no
                                                ? ` · ${b.studentId.phone_no}`
                                                : ""}
                                        </p>
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
                                            Student&apos;s message
                                        </p>
                                        <p className="inquiry-item-body">
                                            {b.message}
                                        </p>
                                    </>
                                )}

                                {b.status === "pending" && (
                                    <div className="owner-form-actions">
                                        <button
                                            type="button"
                                            className="auth-button"
                                            onClick={() =>
                                                handleAction(b._id, "accept")
                                            }
                                            disabled={actingId === b._id}
                                        >
                                            {actingId === b._id
                                                ? "Working…"
                                                : "Accept"}
                                        </button>
                                        <button
                                            type="button"
                                            className="owner-danger-button"
                                            onClick={() =>
                                                handleAction(b._id, "reject")
                                            }
                                            disabled={actingId === b._id}
                                        >
                                            Reject
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

export default BookingRequests;