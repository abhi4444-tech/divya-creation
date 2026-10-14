import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Login.css";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { showAlert } = useAlert();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      showAlert(
        "Missing Information",
        "Please enter email and password.",
        "warning"
      );
      return;
    }

    if (!API_URL) {
      showAlert(
        "Configuration Error",
        "API URL is missing. Please configure VITE_API_URL.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showAlert(
          "Login Failed",
          data.message || "Invalid email or password.",
          "error"
        );
        return;
      }

      // Verify that the backend returned the user.
      if (!data.user) {
        showAlert(
          "Login Error",
          "Login response is missing user information. Please check your backend login API.",
          "error"
        );
        return;
      }

      // Update React authentication state.
      // The backend HttpOnly cookie maintains the session.
      login(data.user);

      showAlert(
        "Welcome Back! 👋",
        "You have successfully logged in.",
        "success"
      );

      // Redirect to the original destination, if provided.
// Redirect to the page requested before login.
const requestedPath =
  location.state?.redirectTo ??
  location.state?.from;

const redirect =
  typeof requestedPath === "string"
    ? requestedPath
    : requestedPath?.pathname || "/";

const safeRedirect =
  redirect.startsWith("/") &&
  !redirect.startsWith("//") &&
  !["/login", "/register"].includes(redirect)
    ? redirect
    : "/";

navigate(safeRedirect, { replace: true });




    } catch (error) {
      console.error("Login Error:", error);

      showAlert(
        "Server Error",
        "Unable to connect to server. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LOGO */}
        <div
          className="login-logo"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/");
            }
          }}
        >
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <h2>Welcome Back!</h2>

        <p className="login-subtitle">
          Login to your account
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className="login-form-group">
            <label htmlFor="login-email">
              Email Address
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="login-form-group">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER */}
        <div className="login-register">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Create Account
          </button>
        </div>

        {/* HOME */}
        <button
          type="button"
          className="back-home-btn"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Login;