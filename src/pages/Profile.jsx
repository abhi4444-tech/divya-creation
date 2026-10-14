import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UserRound,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  Edit3,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

import "../css/profile.css";

function Profile() {
  const navigate = useNavigate();

  const { user, loading, isAuthenticated, logout } = useAuth();
  const { showAlert } = useAlert();

  // Redirect only after the initial session check has completed.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: "/profile" },
      });
    }
  }, [loading, isAuthenticated, navigate]);

  // Logout using the backend HttpOnly cookie.
  const handleLogout = async () => {
    try {
      await logout();

      showAlert(
        "Logged Out",
        "You have successfully logged out.",
        "success"
      );

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);

      showAlert(
        "Logout Failed",
        "Unable to log out right now. Please try again.",
        "error"
      );
    }
  };

  // Wait for session verification before deciding whether to redirect.
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <header className="profile-header">
        <div className="profile-header-inner">
          <Link to="/" className="profile-logo">
            <h1>Divya</h1>
            <span>CREATION</span>
          </Link>

          <Link to="/" className="profile-home-link">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="profile-container">
        <div className="profile-title">
          <h2>My Account</h2>
          <p>
            Manage your profile, orders and account settings
          </p>
        </div>

        <div className="profile-layout">
          {/* LEFT MENU */}
          <aside className="profile-sidebar">
            {/* USER CARD */}
            <div className="profile-user-card">
              <div className="profile-avatar">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <h3>{user.name || "User"}</h3>
                <p>{user.email || "No email"}</p>
              </div>
            </div>

            {/* MENU */}
            <div className="profile-menu">
              <button
                type="button"
                className="active"
                onClick={() => navigate("/profile")}
              >
                <UserRound size={19} />
                <span>My Profile</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-orders")}
              >
                <Package size={19} />
                <span>My Orders</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/wishlist")}
              >
                <Heart size={19} />
                <span>Wishlist</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={19} />
                <span>My Cart</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/saved-addresses")}
              >
                <MapPin size={19} />
                <span>Saved Addresses</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  showAlert(
                    "Coming Soon",
                    "Change password functionality is not available yet.",
                    "warning"
                  )
                }
              >
                <Lock size={19} />
                <span>Change Password</span>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* LOGOUT */}
            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              <LogOut size={19} />
              Logout
            </button>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="profile-content">
            {/* PERSONAL INFORMATION */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h3>Personal Information</h3>
                  <p>Your basic account information</p>
                </div>

                <button
                  type="button"
                  className="edit-profile-btn"
                  onClick={() =>
                    showAlert(
                      "Coming Soon",
                      "Profile editing is not available yet.",
                      "warning"
                    )
                  }
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Full Name</label>
                  <strong>{user.name || "Not available"}</strong>
                </div>

                <div className="profile-info-item">
                  <label>Email Address</label>
                  <strong>{user.email || "Not available"}</strong>
                </div>

                <div className="profile-info-item">
                  <label>Mobile Number</label>
                  <strong>
                    {user.mobile || user.phone || "Not available"}
                  </strong>
                </div>

                <div className="profile-info-item">
                  <label>Gender</label>
                  <strong>{user.gender || "Not available"}</strong>
                </div>
              </div>
            </div>

            {/* ACCOUNT OVERVIEW */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h3>Account Overview</h3>
                  <p>Quick access to your account</p>
                </div>
              </div>

              <div className="profile-overview-grid">
                <button
                  type="button"
                  onClick={() => navigate("/my-orders")}
                  className="overview-box"
                >
                  <Package size={25} />

                  <div>
                    <strong>My Orders</strong>
                    <span>View your orders</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="overview-box"
                >
                  <ShoppingCart size={25} />

                  <div>
                    <strong>My Cart</strong>
                    <span>View your cart</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  className="overview-box"
                  onClick={() => navigate("/wishlist")}
                >
                  <Heart size={25} />

                  <div>
                    <strong>Wishlist</strong>
                    <span>Your saved products</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  className="overview-box"
                  onClick={() => navigate("/saved-addresses")}
                >
                  <MapPin size={25} />

                  <div>
                    <strong>Addresses</strong>
                    <span>Manage addresses</span>
                  </div>

                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;