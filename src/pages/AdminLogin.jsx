import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Admin.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {

      navigate("/admin/dashboard");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-box">

        <div className="admin-logo">
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <h2>Admin Login</h2>

        <p className="admin-login-subtitle">
          Login to manage your products
        </p>

        <form onSubmit={handleLogin}>

          <div className="admin-input-group">

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

          </div>


          <div className="admin-input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>


          <button
            type="submit"
            className="admin-login-btn"
          >
            LOGIN
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;
