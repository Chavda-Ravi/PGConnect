import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMyFavorites,
    removeFavorite,
} from "../../services/favoriteService";
import "../../index.css";

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getMyFavorites();
            const list = Array.isArray(data)
                ? data
                : data.favorites || data.data || [];
            setFavorites(list);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load favorites.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRemove = async (pgId) => {
        setRemovingId(pgId);

        try {
            await removeFavorite(pgId);
            setFavorites((prev) =>
                prev.filter(
                    (f) =>
                        (f.pgId && (f.pgId._id || f.pgId)) !== pgId,
                ),
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Could not remove favorite.",
            );
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading favorites…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>Favorites</h1>
                    <p>PGs you have saved for later.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                {favorites.length === 0 ? (
                    <div className="owner-empty">
                        <p>You haven&apos;t saved any PG yet.</p>
                        <Link className="owner-primary-cta" to="/student/search">
                            Browse PGs
                        </Link>
                    </div>
                ) : (
                    <div className="search-grid">
                        {favorites.map((f) => {
                            const pg = f.pgId;
                            if (!pg || !pg._id) return null;

                            return (
                                <article className="pg-card" key={f._id}>
                                    <div className="pg-card-body">
                                        <h3>{pg.pgName}</h3>
                                        <p className="pg-card-location">
                                            {pg.city}
                                            {pg.state ? `, ${pg.state}` : ""}
                                        </p>
                                        {pg.description && (
                                            <p className="pg-card-desc">
                                                {pg.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pg-card-actions">
                                        <Link
                                            className="pg-card-link"
                                            to={`/student/pg/${pg._id}`}
                                        >
                                            View details
                                        </Link>

                                        <button
                                            type="button"
                                            className="pg-card-link pg-card-remove"
                                            onClick={() =>
                                                handleRemove(pg._id)
                                            }
                                            disabled={removingId === pg._id}
                                        >
                                            {removingId === pg._id
                                                ? "Removing…"
                                                : "Remove"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Favorites;