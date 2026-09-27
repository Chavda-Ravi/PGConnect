import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifySession } from "../services/authService";

function ProtectedRoute({ children, role }) {
    const [status, setStatus] = useState("checking"); // checking | ok | denied

    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            // No local session at all — immediately deny
            if (!token || !storedUser) {
                if (!cancelled) setStatus("denied");
                return;
            }

            // Ask the backend if the token is still valid
            try {
                const data = await verifySession();
                const freshUser = data.user;

                if (cancelled) return;

                if (!freshUser) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setStatus("denied");
                    return;
                }

                // Refresh stored user in case role/name changed
                localStorage.setItem("user", JSON.stringify(freshUser));

                // Role must match the route
                if (role && freshUser.role !== role) {
                    setStatus("wrong-role");
                    return;
                }

                setStatus("ok");
            } catch (err) {
                // 401 → token invalid/expired → clear
                // network failure → can't verify → also deny
                if (cancelled) return;

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setStatus("denied");
            }
        };

        verify();

        return () => {
            cancelled = true;
        };
    }, [role]);

    if (status === "checking") {
        return (
            <main className="student-page">
                <div className="student-inner">
                    <div className="owner-loading">
                        Checking session…
                    </div>
                </div>
            </main>
        );
    }

    if (status === "denied") {
        return <Navigate to="/login" replace />;
    }

    if (status === "wrong-role") {
        // Read role from storage and bounce to the correct dashboard
        let roleFromStorage = "student";
        try {
            const raw = localStorage.getItem("user");
            if (raw) roleFromStorage = JSON.parse(raw).role;
        } catch {
            /* ignore */
        }

        if (roleFromStorage === "pg_owner") {
            return <Navigate to="/owner/dashboard" replace />;
        }
        if (roleFromStorage === "student") {
            return <Navigate to="/student/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;