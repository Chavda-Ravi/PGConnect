import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { searchPGs } from "../services/pgService";
import "../index.css";

function Home() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const dashboardPath =
        user?.role === "pg_owner"
            ? "/owner/dashboard"
            : user?.role === "student"
              ? "/student/dashboard"
              : "/login";

    const [filters, setFilters] = useState({ state: "", city: "" });
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);

    const handleChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value,
        });
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");

        // Guests can search — send them to register first
        if (!isAuthenticated) {
            navigate("/register");
            return;
        }

        if (user?.role !== "student") {
            navigate("/student/search", {
                state: { filters },
            });
            return;
        }

        setSearching(true);

        try {
            await searchPGs(filters);
            // We only need to confirm the call works here; the real
            // result list lives on /student/search.
            navigate("/student/search", { state: { filters } });
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message ||
                        "Search failed. Please try again.",
                );
            }
        } finally {
            setSearching(false);
        }
    };

    return (
        <main className="home-page">

            <section className="home-hero">
                <div className="home-hero-inner">
                    <p className="home-kicker">PGConnect</p>

                    <h1>
                        Find a PG that feels like <span>home</span>.
                    </h1>

                    <p className="home-subtitle">
                        Discover verified paying-guest accommodations across India.
                        Search by state and city, send inquiries, and book with
                        confidence.
                    </p>

                    <div className="home-cta-row">
                        {isAuthenticated ? (
                            <Link className="home-cta primary" to={dashboardPath}>
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link className="home-cta primary" to="/register">
                                    Get Started
                                </Link>
                                <Link className="home-cta ghost" to="/login">
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="home-search">
                <div className="home-search-inner">
                    <h2>Search by location</h2>
                    <p>Pick a state and a city to explore available PGs.</p>

                    {error && <div className="auth-alert error">{error}</div>}

                    <form className="home-search-grid" onSubmit={handleSearch}>
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
                            className="home-search-button"
                            disabled={searching}
                        >
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </form>

                    <small className="home-search-note">
                        {isAuthenticated
                            ? "You will be taken to the search page with these filters."
                            : "Sign up to see results."}
                    </small>
                </div>
            </section>

            <section className="home-steps">
                <div className="home-steps-inner">
                    <h2>How PGConnect works</h2>

                    <div className="home-steps-grid">
                        <article className="home-step-card">
                            <span className="home-step-num">01</span>
                            <h3>Search</h3>
                            <p>
                                Filter PGs by state and city to find options near
                                your college or workplace.
                            </p>
                        </article>

                        <article className="home-step-card">
                            <span className="home-step-num">02</span>
                            <h3>Inquire &amp; Book</h3>
                            <p>
                                Send inquiries to owners, check availability, and
                                request a booking directly from the platform.
                            </p>
                        </article>

                        <article className="home-step-card">
                            <span className="home-step-num">03</span>
                            <h3>Move In</h3>
                            <p>
                                Once your booking is accepted, review the PG and
                                share your experience with other students.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="home-owner">
                <div className="home-owner-inner">
                    <div>
                        <h2>Own a PG?</h2>
                        <p>
                            List your property, manage availability, respond to
                            inquiries, and accept bookings — all from one
                            dashboard.
                        </p>
                    </div>

                    <Link
                        className="home-cta primary"
                        to={isAuthenticated ? dashboardPath : "/register"}
                    >
                        List your PG
                    </Link>
                </div>
            </section>

        </main>
    );
}

export default Home;