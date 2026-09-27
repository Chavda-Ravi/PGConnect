import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_no: "",
        password: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await register(formData);
            setSuccess("Account created successfully. Please sign in.");

            setTimeout(() => {
                navigate("/login");
            }, 900);
        } catch (err) {
            if (!err.response) {
                setError("Backend is not responding. Please restart the server and try again.");
            } else if (err.response.status >= 500) {
                setError(err.response.data?.message || "Server error. Please try again.");
            } else {
                setError(err.response.data?.message || "Registration failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell reverse">
                <aside className="auth-card auth-card-panel">
                    <div>
                        <p className="panel-kicker">PGConnect</p>
                        <h2>Welcome Back!</h2>
                        <p>
                            Already connected with us? Sign in and continue from
                            where you left off.
                        </p>
                    </div>

                    <Link className="panel-button" to="/login">
                        Sign in
                    </Link>
                </aside>

                <div className="auth-card auth-card-form">
                    <div className="auth-mark">PG</div>

                    <div className="auth-heading">
                        <p>Create account</p>
                        <h1>Sign up</h1>
                    </div>

                    {error && <div className="auth-alert error">{error}</div>}
                    {success && <div className="auth-alert success">{success}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="field">
                            <span>Full name</span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>

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
                            <span>Phone number</span>
                            <input
                                type="tel"
                                name="phone_no"
                                placeholder="Enter your phone number"
                                value={formData.phone_no}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />
                        </label>

                        <div className="role-group">
                            <span>Register as</span>

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
                            {loading ? "Creating account..." : "Sign up"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}

export default Register;