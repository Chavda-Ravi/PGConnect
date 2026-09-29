import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import PGSearch from "./pages/student/PGSearch";
import PGDetails from "./pages/student/PGDetails";
import MyInquiries from "./pages/student/MyInquiries";
import MyBookings from "./pages/student/MyBookings";
import Favorites from "./pages/student/Favorites";
import MyReviews from "./pages/student/MyReviews";
import StudentProfile from "./pages/student/StudentProfile";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProfile from "./pages/owner/OwnerProfile";
import MyPGs from "./pages/owner/MyPGs";
import AddPG from "./pages/owner/AddPG";
import EditPG from "./pages/owner/EditPG";
import Availability from "./pages/owner/Availability";
import Inquiries from "./pages/owner/Inquiries";
import BookingRequests from "./pages/owner/BookingRequests";
import Reviews from "./pages/owner/Reviews";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student */}
                    <Route
                        path="/student/dashboard"
                        element={
                            <ProtectedRoute role="student">
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/search"
                        element={
                            <ProtectedRoute role="student">
                                <PGSearch />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/pg/:id"
                        element={
                            <ProtectedRoute role="student">
                                <PGDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/inquiries"
                        element={
                            <ProtectedRoute role="student">
                                <MyInquiries />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/bookings"
                        element={
                            <ProtectedRoute role="student">
                                <MyBookings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/favorites"
                        element={
                            <ProtectedRoute role="student">
                                <Favorites />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/reviews"
                        element={
                            <ProtectedRoute role="student">
                                <MyReviews />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/profile"
                        element={
                            <ProtectedRoute role="student">
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Owner */}
                    <Route
                        path="/owner/dashboard"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/profile"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <OwnerProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/pgs"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <MyPGs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/pgs/add"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <AddPG />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/pgs/edit/:id"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <EditPG />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/availability"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <Availability />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/inquiries"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <Inquiries />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/bookings"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <BookingRequests />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/reviews"
                        element={
                            <ProtectedRoute role="pg_owner">
                                <Reviews />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;