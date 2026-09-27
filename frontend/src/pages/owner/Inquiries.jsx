import { useEffect, useState } from "react";
import { getOwnerInquiries, respondToInquiry } from "../../services/inquiryService";
import "../../index.css";

function Inquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Per-inquiry response draft state: { [inquiryId]: text }
    const [drafts, setDrafts] = useState({});
    // Per-inquiry sending flag: { [inquiryId]: true }
    const [sending, setSending] = useState({});
    // Per-inquiry error: { [inquiryId]: "msg" }
    const [rowError, setRowError] = useState({});

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getOwnerInquiries();
            const list = Array.isArray(data)
                ? data
                : data.inquiries || data.data || [];
            setInquiries(list);

            // Prefill drafts with existing responses
            const prefilled = {};
            list.forEach((i) => {
                prefilled[i._id] = i.response || "";
            });
            setDrafts(prefilled);
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Could not load inquiries.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDraftChange = (id, value) => {
        setDrafts((prev) => ({ ...prev, [id]: value }));
        setRowError((prev) => ({ ...prev, [id]: "" }));
    };

    const handleRespond = async (inquiry) => {
        const text = (drafts[inquiry._id] || "").trim();

        if (!text) {
            setRowError((prev) => ({
                ...prev,
                [inquiry._id]: "Response cannot be empty.",
            }));
            return;
        }

        setSending((prev) => ({ ...prev, [inquiry._id]: true }));
        setRowError((prev) => ({ ...prev, [inquiry._id]: "" }));

        try {
            const data = await respondToInquiry(inquiry._id, {
                response: text,
                status: "answered",
            });

            const updated = data.inquiry || data;
            setInquiries((prev) =>
                prev.map((i) =>
                    i._id === inquiry._id ? { ...i, ...updated } : i,
                ),
            );
        } catch (err) {
            if (!err.response) {
                setRowError((prev) => ({
                    ...prev,
                    [inquiry._id]:
                        "Backend is not responding. Please restart the server and try again.",
                }));
            } else {
                setRowError((prev) => ({
                    ...prev,
                    [inquiry._id]:
                        err.response.data?.message ||
                        "Could not send response.",
                }));
            }
        } finally {
            setSending((prev) => ({ ...prev, [inquiry._id]: false }));
        }
    };

    const statusClass = (status) => {
        if (status === "answered") return "status-pill status-answered";
        if (status === "closed") return "status-pill status-closed";
        return "status-pill status-pending";
    };

    if (loading) {
        return (
            <main className="owner-page">
                <div className="owner-inner">
                    <div className="owner-loading">Loading inquiries…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="owner-page">
            <div className="owner-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Owner</p>
                    <h1>Inquiries</h1>
                    <p>
                        Every message students have sent about your PG
                        listings.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {inquiries.length === 0 ? (
                    <div className="owner-empty">
                        <p>No inquiries yet.</p>
                    </div>
                ) : (
                    <div className="inquiry-list">
                        {inquiries.map((inquiry) => (
                            <article
                                key={inquiry._id}
                                className="inquiry-item"
                            >
                                <header className="inquiry-item-head">
                                    <div>
                                        <h3>
                                            {inquiry.pgId?.pgName ||
                                                "PG removed"}
                                        </h3>
                                        {inquiry.pgId && (
                                            <p className="inquiry-item-loc">
                                                {inquiry.pgId.city}
                                                {inquiry.pgId.state
                                                    ? `, ${inquiry.pgId.state}`
                                                    : ""}
                                            </p>
                                        )}
                                        <p className="inquiry-item-from">
                                            From:{" "}
                                            {inquiry.studentId?.name ||
                                                "Student"}
                                            {inquiry.studentId?.email
                                                ? ` (${inquiry.studentId.email})`
                                                : ""}
                                            {inquiry.studentId?.phone_no
                                                ? ` · ${inquiry.studentId.phone_no}`
                                                : ""}
                                        </p>
                                    </div>

                                    <span className={statusClass(inquiry.status)}>
                                        {inquiry.status}
                                    </span>
                                </header>

                                <p className="inquiry-item-label">Message</p>
                                <p className="inquiry-item-body">
                                    {inquiry.message}
                                </p>

                                <p className="inquiry-item-label">
                                    {inquiry.response
                                        ? "Your response"
                                        : "Write a response"}
                                </p>

                                <textarea
                                    className="inquiry-response-input"
                                    rows="3"
                                    placeholder="Reply to the student…"
                                    value={drafts[inquiry._id] || ""}
                                    onChange={(e) =>
                                        handleDraftChange(
                                            inquiry._id,
                                            e.target.value,
                                        )
                                    }
                                />

                                {rowError[inquiry._id] && (
                                    <div className="auth-alert error">
                                        {rowError[inquiry._id]}
                                    </div>
                                )}

                                <div className="owner-form-actions">
                                    <button
                                        className="auth-button"
                                        type="button"
                                        onClick={() =>
                                            handleRespond(inquiry)
                                        }
                                        disabled={sending[inquiry._id]}
                                    >
                                        {sending[inquiry._id]
                                            ? "Sending…"
                                            : inquiry.response
                                              ? "Update response"
                                              : "Send response"}
                                    </button>
                                </div>

                                <p className="inquiry-item-date">
                                    Sent{" "}
                                    {new Date(
                                        inquiry.createdAt,
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

export default Inquiries;