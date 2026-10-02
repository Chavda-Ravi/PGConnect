import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    createStudentProfile,
    getStudentProfile,
    updateStudentProfile,
} from "../../services/studentService";
import "../../index.css";

function StudentProfile() {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        college: "",
        course: "",
        year: "",
        gender: "",
        city: "",
    });

    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getStudentProfile();
                const profile = data.student;

                if (profile && profile._id) {
                    setFormData({
                        college: profile.college || "",
                        course: profile.course || "",
                        year: profile.year || "",
                        gender: profile.gender || "",
                        city: profile.city || "",
                    });
                    setExists(true);
                }
            } catch (err) {
                // 404 = no profile yet — that's fine, we show the create form
                if (err.response && err.response.status !== 404) {
                    setError(
                        err.response.data?.message ||
                            "Could not load your profile.",
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

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
        setSaving(true);

        try {
            if (exists) {
                await updateStudentProfile(formData);
                setSuccess("Profile updated.");
            } else {
                await createStudentProfile(formData);
                setExists(true);
                setSuccess("Profile created.");
            }
        } catch (err) {
            if (!err.response) {
                setError(
                    "Backend is not responding. Please restart the server and try again.",
                );
            } else {
                setError(
                    err.response.data?.message || "Could not save your profile.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">Loading profile…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="student-page">
            <div className="student-inner">
                <header className="owner-header">
                    <p className="owner-kicker">Student</p>
                    <h1>
                        {exists ? "Edit your profile" : "Create your profile"}
                    </h1>
                    <p>
                        Your academic details. Helps owners understand who
                        they&apos;re speaking with.
                    </p>
                </header>

                {/* Read-only identity from User account */}
                <section className="owner-form" style={{ marginBottom: 20 }}>
                    <div className="profile-readout">
                        <div>
                            <span className="profile-readout-label">Name</span>
                            <span className="profile-readout-value">
                                {user?.name || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="profile-readout-label">Email</span>
                            <span className="profile-readout-value">
                                {user?.email || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="profile-readout-label">Phone</span>
                            <span className="profile-readout-value">
                                {user?.phone_no || "—"}
                            </span>
                        </div>
                    </div>
                </section>

                {error && <div className="auth-alert error">{error}</div>}
                {success && <div className="auth-alert success">{success}</div>}

                <form className="owner-form" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>College</span>
                        <input
                            type="text"
                            name="college"
                            placeholder="e.g. Dharmsinh Desai University"
                            value={formData.college}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field">
                        <span>Course</span>
                        <input
                            type="text"
                            name="course"
                            placeholder="e.g. B.Tech Computer Engineering"
                            value={formData.course}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field">
                        <span>Year</span>
                        <input
                            type="text"
                            name="year"
                            placeholder="e.g. 3rd Year"
                            value={formData.year}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field">
                        <span>Gender</span>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label className="field">
                        <span>City</span>
                        <input
                            type="text"
                            name="city"
                            placeholder="e.g. Nadiad"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </label>

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving…"
                            : exists
                              ? "Save changes"
                              : "Create profile"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default StudentProfile;