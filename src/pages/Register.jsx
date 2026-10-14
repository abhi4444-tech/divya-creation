import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    // VALIDATION
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      showAlert(
        "Missing Information",
        "Please fill all fields.",
        "warning"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      showAlert(
        "Password Error",
        "Passwords do not match.",
        "error"
      );
      return;
    }

    if (form.password.length < 6) {
      showAlert(
        "Password Too Short",
        "Password must be at least 6 characters.",
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

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      // REGISTRATION FAILED
      if (!response.ok || !data.success) {
        showAlert(
          "Registration Failed",
          data.message || "Registration failed. Please try again.",
          "error"
        );
        return;
      }

      // If the backend also logs in the user and returns a user,
      // update the React authentication state.
      if (data.user) {
        login(data.user);

        showAlert(
          "Congratulations! 🎉",
          "Your account has been created successfully.",
          "success"
        );

        navigate("/", { replace: true });
        return;
      }

      // If registration does not automatically log the user in,
      // send them to the login page.
      showAlert(
        "Registration Successful! 🎉",
        "Your account has been created. Please log in.",
        "success"
      );

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Register Error:", error);

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
    <div className="register-page">
      <div className="register-card">
        {/* LOGO */}
        <div
          className="register-logo"
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

        <h2>Create Account</h2>

        <p className="register-subtitle">
          Join Divya Creation
        </p>

        <form onSubmit={handleRegister}>
          {/* NAME */}
          <div className="register-form-group">
            <label htmlFor="register-name">Full Name</label>

            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="register-form-group">
            <label htmlFor="register-email">Email Address</label>

            <input
              id="register-email"
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

          {/* PHONE */}
          <div className="register-form-group">
            <label htmlFor="register-phone">Phone Number</label>

            <input
              id="register-phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="register-form-group">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="register-form-group">
            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN */}
        <div className="register-login">
          <span>Already have an account?</span>

          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Login
          </button>
        </div>

        {/* HOME */}
        <button
          type="button"
          className="register-home-btn"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Register;