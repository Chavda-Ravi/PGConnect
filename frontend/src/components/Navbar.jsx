import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isAuthPage =
        location.pathname === "/login" || location.pathname === "/register";

    if (isAuthPage) {
        return null;
    }

    const dashboardPath =
        user?.role === "pg_owner"
            ? "/owner/dashboard"
            : user?.role === "student"
              ? "/student/dashboard"
              : "/";

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link className="navbar-brand" to={isAuthenticated ? dashboardPath : "/login"}>
                    <span className="navbar-mark">PG</span>
                    <span className="navbar-name">PGConnect</span>
                </Link>

                <nav className="navbar-links">
                    {isAuthenticated && user?.role === "student" && (
                        <>
                            <Link to="/student/dashboard">Dashboard</Link>
                            <Link to="/student/search">Search PG</Link>
                            <Link to="/student/bookings">My Bookings</Link>
                            <Link to="/student/inquiries">My Inquiries</Link>
                            <Link to="/student/reviews">My Reviews</Link>
                            <Link to="/student/favorites">Favorites</Link>
                        </>
                    )}

                    {isAuthenticated && user?.role === "pg_owner" && (
                        <>
                            <Link to="/owner/dashboard">Dashboard</Link>
                            <Link to="/owner/pgs">My PGs</Link>
                            <Link to="/owner/bookings">Bookings</Link>
                            <Link to="/owner/inquiries">Inquiries</Link>
                            <Link to="/owner/reviews">Reviews</Link>
                            <Link to="/owner/profile">Profile</Link>
                        </>
                    )}
                </nav>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                {user?.name}
                                <small>{user?.role?.replace("_", " ")}</small>
                            </span>

                            <button
                                type="button"
                                className="navbar-logout"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link className="navbar-login" to="/login">
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;