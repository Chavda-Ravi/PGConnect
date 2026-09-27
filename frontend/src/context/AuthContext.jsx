import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [ready, setReady] = useState(false);

    // Hydrate from localStorage once on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setReady(true);
    }, []);

    const login = async ({ email, password, expectedRole }) => {
        const data = await loginUser({ email, password });

        if (!data.token || !data.user) {
            throw new Error("Invalid response from server.");
        }

        if (expectedRole && data.user.role !== expectedRole) {
            throw new Error(
                `This account is registered as ${data.user.role.replace("_", " ")}.`,
            );
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        return data.user;
    };

    const register = async (payload) => {
        return registerUser(payload);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                ready,
                isAuthenticated: Boolean(token && user),
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }

    return ctx;
}

export default AuthContext;