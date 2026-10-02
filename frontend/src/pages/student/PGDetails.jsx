import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPGById } from "../../services/pgService";
import { getAvailabilityByPG } from "../../services/availabilityService";
import { getReviewsByPG, createReview } from "../../services/reviewService";
import { createInquiry } from "../../services/inquiryService";
import {
    createBooking,
    getStudentBookings,
} from "../../services/bookingService";
import {
    addFavorite,
    checkFavorite,
    removeFavorite,
} from "../../services/favoriteService";
import "../../index.css";

function PGDetails() {
    const { id } = useParams();
    const { user } = useAuth();

    const [pg, setPg] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [myBookings, setMyBookings] = useState([]);

    const [activeImage, setActiveImage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isFavorite, setIsFavorite] = useState(false);
    const [favBusy, setFavBusy] = useState(false);
    const [favError, setFavError] = useState("");

    const [inquiryMessage, setInquiryMessage] = useState("");
    const [inquirySending, setInquirySending] = useState(false);
    const [inquiryError, setInquiryError] = useState("");
    const [inquirySuccess, setInquirySuccess] = useState("");

    const [bookingForm, setBookingForm] = useState({
        startDate: "",
        duration: "",
        message: "",
    });
    const [bookingSending, setBookingSending] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");

    const [acceptedBooking, setAcceptedBooking] = useState(null);
    const [myReview, setMyReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviewSending, setReviewSending] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;

        const safe = async (fn, fallback) => {
            try {
                return await fn();
            } catch {
                return fallback;
            }
        };

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const pgData = await getPGById(id);
                if (cancelled) return;
                const resolved = pgData.pg || pgData.data || pgData;
                setPg(resolved);
            } catch (err) {
                if (cancelled) return;

                if (!err.response) {
                    setError(
                        "Backend is not responding. Please restart the server and try again.",
                    );
                } else if (err.response.status === 404) {
                    setError("This PG listing could not be found.");
                } else {
                    setError(
                        err.response.data?.message ||
                            "Could not load PG details.",
                    );
                }

                setLoading(false);
                return;
            }

            const [availRes, reviewRes, favRes, bookingsRes] =
                await Promise.all([
                    safe(() => getAvailabilityByPG(id), null),
                    safe(() => getReviewsByPG(id), { reviews: [] }),
                    safe(() => checkFavorite(id), { isFavorite: false }),
                    safe(() => getStudentBookings(), { bookings: [] }),
                ]);

            if (cancelled) return;

            if (availRes) {
                setAvailability(
                    availRes.availability || availRes.data || availRes,
                );
            } else {
                setAvailability(null);
            }

            const reviewList = Array.isArray(reviewRes)
                ? reviewRes
                : reviewRes.reviews || reviewRes.data || [];
            setReviews(reviewList);

            if (user?.id || user?._id) {
                const userId = user.id || user._id;
                const mine = reviewList.find(
                    (r) =>
                        r.studentId &&
                        (r.studentId._id === userId ||
                            r.studentId === userId),
                );
                setMyReview(mine || null);
            } else {
                setMyReview(null);
            }

            setIsFavorite(Boolean(favRes?.isFavorite));

            const bookingList = Array.isArray(bookingsRes)
                ? bookingsRes
                : bookingsRes.bookings || [];
            setMyBookings(bookingList);

            const accepted = bookingList.find(
                (b) =>
                    b.pgId &&
                    (b.pgId._id === id || b.pgId === id) &&
                    b.status === "accepted",
            );
            setAcceptedBooking(accepted || null);

            setLoading(false);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [id, user]);

    const handleFavoriteToggle = async () => {
        setFavError("");
        setFavBusy(true);

        try {
            if (isFavorite) {
                await removeFavorite(id);
                setIsFavorite(false);
            } else {
                await addFavorite(id);
                setIsFavorite(true);
            }
        } catch (err) {
            setFavError(
                err.response?.data?.message ||
                    "Could not update favorite. Please try again.",
            );
        } finally {
            setFavBusy(false);
        }
    };

    const handleInquirySubmit = async (event) => {
        event.preventDefault();
        setInquiryError("");
        setInquirySuccess("");

        if (!inquiryMessage.trim()) {
            setInquiryError("Please write a message.");
            return;
        }

        setInquirySending(true);

        try {
            await createInquiry({ pgId: id, message: inquiryMessage.trim() });
            setInquiryMessage("");
            setInquirySuccess("Inquiry sent. The owner will get back to you.");
        } catch (err) {
            setInquiryError(
                err.response?.data?.message ||
                    "Could not send inquiry. Please try again.",
            );
        } finally {
            setInquirySending(false);
        }
    };

    const handleBookingChange = (event) => {
        setBookingForm({
            ...bookingForm,
            [event.target.name]: event.target.value,
        });
        setBookingError("");
        setBookingSuccess("");
    };

    const handleBookingSubmit = async (event) => {
        event.preventDefault();
        setBookingError("");
        setBookingSuccess("");

        if (!bookingForm.startDate) {
            setBookingError("Please choose a start date.");
            return;
        }

        if (!bookingForm.duration || Number(bookingForm.duration) < 1) {
            setBookingError("Duration must be at least 1 month.");
            return;
        }

        setBookingSending(true);

        try {
            await createBooking({
                pgId: id,
                startDate: bookingForm.startDate,
                duration: Number(bookingForm.duration),
                message: bookingForm.message.trim(),
            });
            setBookingForm({ startDate: "", duration: "", message: "" });
            setBookingSuccess(
                "Booking request sent. The owner will review it shortly.",
            );
        } catch (err) {
            setBookingError(
                err.response?.data?.message ||
                    "Could not create booking. Please try again.",
            );
        } finally {
            setBookingSending(false);
        }
    };

    const handleReviewChange = (event) => {
        setReviewForm({
            ...reviewForm,
            [event.target.name]:
                event.target.name === "rating"
                    ? Number(event.target.value)
                    : event.target.value,
        });
        setReviewError("");
        setReviewSuccess("");
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        setReviewError("");
        setReviewSuccess("");

        if (!acceptedBooking) {
            setReviewError(
                "You can only review a PG after a booking is accepted.",
            );
            return;
        }

        setReviewSending(true);

        try {
            const data = await createReview({
                pgId: id,
                bookingId: acceptedBooking._id,
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim(),
            });
            const resolved = data.review || data;
            setMyReview(resolved);
            setReviews((prev) => [resolved, ...prev]);
            setReviewForm({ rating: 5, comment: "" });
            setReviewSuccess("Review submitted. Thank you!");
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                    "Could not submit review. Please try again.",
            );
        } finally {
            setReviewSending(false);
        }
    };

    const maxStartDate = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().slice(0, 10);
    })();

    const minStartDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    })();

    const hasAcceptedHere = myBookings.some(
        (b) =>
            b.status === "accepted" &&
            b.pgId &&
            (b.pgId._id || b.pgId) === id,
    );

    const hasAcceptedElsewhere = myBookings.some(
        (b) =>
            b.status === "accepted" &&
            b.pgId &&
            (b.pgId._id || b.pgId) !== id,
    );

    const hasPendingHere = myBookings.some(
        (b) =>
            b.status === "pending" &&
            b.pgId &&
            (b.pgId._id || b.pgId) === id,
    );

    const bookingLocked =
        hasAcceptedHere || hasAcceptedElsewhere || hasPendingHere;

    const bookingLockReason = hasAcceptedHere
        ? "You already have an accepted booking for this PG."
        : hasAcceptedElsewhere
          ? "You already have an accepted booking for another PG."
          : hasPendingHere
            ? "You already have a pending booking request for this PG."
            : "";

    if (loading) {
        return (
            <main className="spd-page">
                <div className="spd-inner">
                    <div className="pgd-loading">Loading PG details…</div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="spd-page">
                <div className="spd-inner">
                    <Link className="pgd-back" to="/student/search">
                        ← Back to search
                    </Link>
                    <div
                        className="auth-alert error"
                        style={{ marginTop: 16 }}
                    >
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    if (!pg) return null;

    const images = Array.isArray(pg.images) ? pg.images : [];
    const hasImages = images.length > 0;

    const avgRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  reviews.length
              ).toFixed(1)
            : null;

    const canReview = acceptedBooking && !myReview;
    const isFull = availability && availability.availableBeds === 0;

    return (
        <main className="spd-page">
            <div className="spd-inner">
                <Link className="pgd-back" to="/student/search">
                    ← Back to search
                </Link>

                <section className="spd-hero">
                    <div className="spd-hero-gallery">
                        {hasImages ? (
                            <>
                                <button
                                    type="button"
                                    className="spd-hero-main"
                                    onClick={() =>
                                        setActiveImage(
                                            (activeImage + 1) % images.length,
                                        )
                                    }
                                    aria-label="Show next photo"
                                >
                                    <img
                                        src={images[activeImage]}
                                        alt={pg.pgName}
                                    />
                                </button>

                                <div className="spd-hero-side">
                                    {images.slice(1, 4).map((url, i) => {
                                        const realIndex = i + 1;
                                        const isLastSlot = i === 2;
                                        const extraCount =
                                            images.length > 4
                                                ? images.length - 4
                                                : 0;

                                        return (
                                            <button
                                                key={url}
                                                type="button"
                                                className={
                                                    realIndex === activeImage
                                                        ? "spd-hero-thumb active"
                                                        : "spd-hero-thumb"
                                                }
                                                onClick={() =>
                                                    setActiveImage(realIndex)
                                                }
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Thumb ${realIndex + 1}`}
                                                />

                                                {isLastSlot && extraCount > 0 && (
                                                    <span className="spd-hero-thumb-overlay">
                                                        +{extraCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="spd-hero-empty">
                                No photos yet
                            </div>
                        )}
                    </div>

                    <aside className="spd-action-card">
                        <div className="spd-action-top">
                            <div>
                                <p className="spd-action-kicker">
                                    PG listing
                                </p>
                                <h1 className="spd-action-title">
                                    {pg.pgName}
                                </h1>
                                <p className="spd-action-loc">
                                    {pg.city}
                                    {pg.state ? `, ${pg.state}` : ""}
                                </p>
                            </div>

                            {avgRating && (
                                <div className="spd-action-rating">
                                    <span className="spd-action-rating-val">
                                        {avgRating}
                                    </span>
                                    <span className="spd-action-rating-lbl">
                                        {reviews.length} review
                                        {reviews.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="spd-action-avail">
                            <div>
                                <span className="spd-avail-num">
                                    {availability
                                        ? availability.availableBeds
                                        : "—"}
                                </span>
                                <span className="spd-avail-label">
                                    beds available
                                </span>
                            </div>
                            {availability && (
                                <span className="spd-avail-total">
                                    of {availability.totalBeds} total
                                </span>
                            )}
                        </div>

                        {favError && (
                            <div className="auth-alert error">
                                {favError}
                            </div>
                        )}

                        <div className="spd-action-buttons">
                            <button
                                type="button"
                                className="spd-action-primary"
                                onClick={() => {
                                    const target =
                                        document.querySelector(
                                            ".spd-booking-anchor",
                                        );
                                    if (target) {
                                        target.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }
                                }}
                                disabled={bookingLocked || isFull}
                            >
                                {isFull
                                    ? "No beds available"
                                    : bookingLocked
                                      ? "Booking locked"
                                      : "Request booking"}
                            </button>

                            <button
                                type="button"
                                className={
                                    isFavorite
                                        ? "spd-action-secondary is-favorite"
                                        : "spd-action-secondary"
                                }
                                onClick={handleFavoriteToggle}
                                disabled={favBusy}
                            >
                                {isFavorite ? "♥ Saved" : "♡ Save"}
                            </button>
                        </div>

                        <div className="spd-action-contact">
                            <span className="spd-action-contact-label">
                                Contact
                            </span>
                            <span className="spd-action-contact-value">
                                {pg.contactNo || "—"}
                            </span>
                        </div>
                    </aside>
                </section>

                <div className="spd-layout">
                    <div className="spd-left">
                        <section className="pgd-card">
                            <h2>About this PG</h2>
                            {pg.description ? (
                                <p className="pgd-desc">
                                    {pg.description}
                                </p>
                            ) : (
                                <p className="pgd-muted">
                                    No description provided by the owner
                                    yet.
                                </p>
                            )}
                        </section>

                        <section className="pgd-card">
                            <h2>Address</h2>
                            <p className="pgd-address">
                                {pg.address || "—"}
                            </p>
                            <p className="pgd-muted">
                                {pg.city}
                                {pg.state ? `, ${pg.state}` : ""}
                            </p>
                        </section>

                        <section className="pgd-card">
                            <h2>Reviews</h2>

                            {reviewError && (
                                <div className="auth-alert error">
                                    {reviewError}
                                </div>
                            )}
                            {reviewSuccess && (
                                <div className="auth-alert success">
                                    {reviewSuccess}
                                </div>
                            )}

                            {canReview && (
                                <form
                                    className="review-form"
                                    onSubmit={handleReviewSubmit}
                                >
                                    <p className="review-form-title">
                                        Leave a review for this PG
                                    </p>

                                    <label className="field">
                                        <span>Rating</span>
                                        <select
                                            name="rating"
                                            value={reviewForm.rating}
                                            onChange={handleReviewChange}
                                        >
                                            <option value={5}>
                                                ★★★★★ (5)
                                            </option>
                                            <option value={4}>
                                                ★★★★ (4)
                                            </option>
                                            <option value={3}>
                                                ★★★ (3)
                                            </option>
                                            <option value={2}>
                                                ★★ (2)
                                            </option>
                                            <option value={1}>
                                                ★ (1)
                                            </option>
                                        </select>
                                    </label>

                                    <label className="field">
                                        <span>Comment (optional)</span>
                                        <textarea
                                            name="comment"
                                            rows="3"
                                            placeholder="How was your stay?"
                                            value={reviewForm.comment}
                                            onChange={handleReviewChange}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="auth-button"
                                        disabled={reviewSending}
                                    >
                                        {reviewSending
                                            ? "Submitting…"
                                            : "Submit review"}
                                    </button>
                                </form>
                            )}

                            {!canReview && myReview && (
                                <p className="pgd-muted">
                                    You have already reviewed this PG.
                                </p>
                            )}

                            {!canReview &&
                                !myReview &&
                                !acceptedBooking && (
                                    <p className="pgd-muted">
                                        You can review this PG after your
                                        booking is accepted.
                                    </p>
                                )}

                            {reviews.length === 0 ? (
                                <p className="pgd-muted">
                                    No reviews yet.
                                </p>
                            ) : (
                                <ul className="pgd-review-list">
                                    {reviews.map((review) => (
                                        <li
                                            key={review._id}
                                            className="pgd-review"
                                        >
                                            <div className="pgd-review-head">
                                                <span className="pgd-review-stars">
                                                    {"★".repeat(
                                                        review.rating || 0,
                                                    )}
                                                    {"☆".repeat(
                                                        5 -
                                                            (review.rating ||
                                                                0),
                                                    )}
                                                </span>
                                                <span className="pgd-review-date">
                                                    {review.studentId?.name
                                                        ? `by ${review.studentId.name} · `
                                                        : ""}
                                                    {review.createdAt
                                                        ? new Date(
                                                              review.createdAt,
                                                          ).toLocaleDateString()
                                                        : ""}
                                                </span>
                                            </div>

                                            {review.comment && (
                                                <p className="pgd-review-comment">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    <aside className="spd-right">
                        <section className="pgd-card spd-card-sticky spd-booking-anchor">
                            <h2 className="spd-block-title">
                                Request booking
                            </h2>

                            {bookingError && (
                                <div className="auth-alert error">
                                    {bookingError}
                                </div>
                            )}
                            {bookingSuccess && (
                                <div className="auth-alert success">
                                    {bookingSuccess}
                                </div>
                            )}

                            {isFull && (
                                <div className="auth-alert error">
                                    No beds available right now.
                                </div>
                            )}

                            {bookingLocked ? (
                                <p className="pgd-muted">
                                    {bookingLockReason}
                                </p>
                            ) : (
                                <form
                                    className="booking-form"
                                    onSubmit={handleBookingSubmit}
                                >
                                    <div className="booking-form-row">
                                        <label className="field">
                                            <span>Start date</span>
                                            <input
                                                type="date"
                                                name="startDate"
                                                min={minStartDate}
                                                max={maxStartDate}
                                                value={
                                                    bookingForm.startDate
                                                }
                                                onChange={
                                                    handleBookingChange
                                                }
                                                required
                                            />
                                            <small className="field-hint">
                                                Within next 6 months.
                                            </small>
                                        </label>

                                        <label className="field">
                                            <span>Duration (months)</span>
                                            <input
                                                type="number"
                                                name="duration"
                                                min="1"
                                                placeholder="e.g. 6"
                                                value={
                                                    bookingForm.duration
                                                }
                                                onChange={
                                                    handleBookingChange
                                                }
                                                required
                                            />
                                        </label>
                                    </div>

                                    <label className="field">
                                        <span>Message (optional)</span>
                                        <textarea
                                            name="message"
                                            rows="2"
                                            placeholder="Anything the owner should know?"
                                            value={bookingForm.message}
                                            onChange={handleBookingChange}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="auth-button"
                                        disabled={bookingSending || isFull}
                                    >
                                        {bookingSending
                                            ? "Sending…"
                                            : "Request booking"}
                                    </button>
                                </form>
                            )}
                        </section>

                        <section className="pgd-card">
                            <h2 className="spd-block-title">
                                Send an inquiry
                            </h2>

                            {inquiryError && (
                                <div className="auth-alert error">
                                    {inquiryError}
                                </div>
                            )}
                            {inquirySuccess && (
                                <div className="auth-alert success">
                                    {inquirySuccess}
                                </div>
                            )}

                            <form
                                className="inquiry-form"
                                onSubmit={handleInquirySubmit}
                            >
                                <label className="field">
                                    <span>Message to the owner</span>
                                    <textarea
                                        name="message"
                                        rows="3"
                                        placeholder="Ask about rooms, availability, move-in date, rules…"
                                        value={inquiryMessage}
                                        onChange={(e) =>
                                            setInquiryMessage(e.target.value)
                                        }
                                    />
                                </label>

                                <button
                                    type="submit"
                                    className="auth-button"
                                    disabled={inquirySending}
                                >
                                    {inquirySending
                                        ? "Sending…"
                                        : "Send inquiry"}
                                </button>
                            </form>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default PGDetails;