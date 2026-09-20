import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/owner/dashboard"
                    element={
                        <ProtectedRoute role="pg_owner">
                            <OwnerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
