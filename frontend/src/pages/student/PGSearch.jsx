import { useState } from "react";
import { Link } from "react-router-dom";
import { searchPGs } from "../../services/pgService";
import "../../index.css";

function PGSearch() {
    const [filters, setFilters] = useState({ state: "", city: "" });
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value,
        });
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await searchPGs(filters);
            // Backend may return an array, or { pgs: [...] }, or { results: [...] }
            const list = Array.isArray(data)
                ? data
                : data.pgs || data.results || data.data || [];
            setResults(list);
            setSearched(true);
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Could not fetch PGs. Please try again.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="search-page">
            <div className="search-inner">
                <header className="search-header">
                    <p className="search-kicker">Discovery</p>
                    <h1>Find a PG</h1>
                    <p>Search by state and city. Both fields are optional.</p>
                </header>

                <form className="search-bar" onSubmit={handleSearch}>
                    <label className="field">
                        <span>State</span>
                        <input
                            type="text"
                            name="state"
                            placeholder="e.g. Gujarat"
                            value={filters.state}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field">
                        <span>City</span>
                        <input
                            type="text"
                            name="city"
                            placeholder="e.g. Ahmedabad"
                            value={filters.city}
                            onChange={handleChange}
                        />
                    </label>

                    <button
                        type="submit"
                        className="search-button"
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>

                {error && <div className="auth-alert error">{error}</div>}

                {searched && !loading && results.length === 0 && (
                    <div className="search-empty">
                        No PGs found for these filters. Try a different state or
                        city.
                    </div>
                )}

                {results.length > 0 && (
                    <div className="search-results">
                        <p className="search-count">
                            {results.length} PG{results.length > 1 ? "s" : ""} found
                        </p>

                        <div className="search-grid">
                            {results.map((pg) => (
                                <article className="pg-card" key={pg._id}>
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

                                        {pg.contactNo && (
                                            <p className="pg-card-contact">
                                                Contact: {pg.contactNo}
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        className="pg-card-link"
                                        to={`/student/pg/${pg._id}`}
                                    >
                                        View details
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default PGSearch;