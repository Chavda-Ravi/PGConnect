import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const loggedInUser = await login({
                email: formData.email,
                password: formData.password,
                expectedRole: formData.role,
            });

            if (loggedInUser.role === "student") {
                navigate("/student/dashboard");
                return;
            }

            if (loggedInUser.role === "pg_owner") {
                navigate("/owner/dashboard");
                return;
            }

            setError("Unsupported user role.");
        } catch (err) {
            if (err.response) {
                if (err.response.status >= 500) {
                    setError(
                        err.response.data?.message ||
                            "Server error. Please try again.",
                    );
                } else {
                    setError(
                        err.response.data?.message ||
                            "Invalid email or password.",
                    );
                }
            } else if (err.message) {
                setError(err.message);
            } else {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-card auth-card-form">
                    <div className="auth-mark">PG</div>

                    <div className="auth-heading">
                        <p>Welcome back</p>
                        <h1>Sign in</h1>
                    </div>

                    {error && <div className="auth-alert error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="field">
                            <span>Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <div className="role-group">
                            <span>Login as</span>

                            <div className="segmented-control">
                                <label className={formData.role === "student" ? "active" : ""}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        checked={formData.role === "student"}
                                        onChange={handleChange}
                                    />
                                    Student
                                </label>

                                <label className={formData.role === "pg_owner" ? "active" : ""}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="pg_owner"
                                        checked={formData.role === "pg_owner"}
                                        onChange={handleChange}
                                    />
                                    PG Owner
                                </label>
                            </div>
                        </div>

                        <button className="auth-button" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>

                <aside className="auth-card auth-card-panel">
                    <div>
                        <p className="panel-kicker">PGConnect</p>
                        <h2>Hello, Friend!</h2>
                        <p>
                            Enter your details and continue your student accommodation
                            journey with us.
                        </p>
                    </div>

                    <Link className="panel-button" to="/register">
                        Sign up
                    </Link>
                </aside>
            </section>
        </main>
    );
}

export default Login;