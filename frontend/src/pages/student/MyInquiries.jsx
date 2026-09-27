import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyInquiries } from "../../services/inquiryService";
import "../../index.css";

function MyInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getMyInquiries();
                const list = Array.isArray(data)
                    ? data
                    : data.inquiries || data.data || [];
                setInquiries(list);
            } catch (err) {
                if (!err.response) {
                    setError(
                        "Backend is not responding. Please restart the server and try again.",
                    );
                } else {
                    setError(
                        err.response.data?.message ||
                            "Could not load your inquiries.",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const statusClass = (status) => {
        if (status === "answered") return "status-pill status-answered";
        if (status === "closed") return "status-pill status-closed";
        return "status-pill status-pending";
    };

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading inquiries…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>My Inquiries</h1>
                    <p>
                        Every message you have sent to a PG owner, and any
                        replies you have received.
                    </p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {inquiries.length === 0 ? (
                    <div className="owner-empty">
                        <p>You haven&apos;t sent any inquiries yet.</p>
                        <Link className="owner-primary-cta" to="/student/search">
                            Browse PGs
                        </Link>
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
                                    </div>

                                    <span className={statusClass(inquiry.status)}>
                                        {inquiry.status}
                                    </span>
                                </header>

                                <p className="inquiry-item-label">
                                    Your message
                                </p>
                                <p className="inquiry-item-body">
                                    {inquiry.message}
                                </p>

                                {inquiry.response ? (
                                    <>
                                        <p className="inquiry-item-label">
                                            Owner&apos;s reply
                                        </p>
                                        <p className="inquiry-item-body inquiry-reply">
                                            {inquiry.response}
                                        </p>
                                    </>
                                ) : (
                                    <p className="inquiry-item-muted">
                                        No reply yet.
                                    </p>
                                )}

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

export default MyInquiries;