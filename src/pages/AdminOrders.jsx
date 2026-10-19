import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ALL ORDERS FROM MYSQL
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/admin/all`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("ADMIN ORDERS ERROR:", err);

      setError(
        err.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update order status"
        );
      }

      // Screen par immediately status update
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      alert("Order status updated successfully ✅");
    } catch (err) {
      console.error(
        "STATUS UPDATE ERROR:",
        err
      );

      alert(
        err.message ||
          "Failed to update order status"
      );

      // Agar update fail hua to fresh data lao
      fetchOrders();
    }
  };

  // =====================================================
  // STATUS TEXT
  // =====================================================

  
const getStatusText = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "packed":
      return "Packed";

    case "shipped":
      return "Shipped";

    case "out_for_delivery":
      return "Out for Delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    case "failed":
      return "Failed";

    default:
      return status || "Unknown";
  }
};


  // =====================================================
  // STATUS COLOR CLASS
  // =====================================================

  
const getStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "pending";

    case "confirmed":
      return "confirmed";

    case "packed":
      return "packed";

    case "shipped":
      return "shipped";

    case "out_for_delivery":
      return "out-for-delivery";

    case "delivered":
      return "delivered";

    case "cancelled":
      return "cancelled";

    case "failed":
      return "failed";

    default:
      return "pending";
  }
};


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            <h1>Divya</h1>
            <span>CREATION</span>
          </div>
        </aside>

        <main className="admin-main">
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2>Loading Orders...</h2>
            <p>Please wait.</p>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-logo">
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <div className="admin-menu">

          <Link
            to="/admin/dashboard"
            className="admin-menu-item"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/admin/add-product"
            className="admin-menu-item"
          >
            ➕ Add Product
          </Link>

          <Link
            to="/admin/orders"
            className="admin-menu-item active"
          >
            📦 Customer Orders
          </Link>

          <Link
            to="/"
            className="admin-menu-item"
          >
            🏠 View Website
          </Link>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        <div className="admin-top">

          <div>

            <h2>
              Customer Orders
            </h2>

            <p>
              View and manage all customer orders
            </p>

          </div>

          <button
            type="button"
            onClick={fetchOrders}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "8px",
              background: "#ffe5e5",
              color: "#c62828",
            }}
          >
            <strong>Error:</strong> {error}

            <br />

            <button
              onClick={fetchOrders}
              style={{
                marginTop: "10px",
                padding: "8px 15px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            ORDERS BOX
        ================================================= */}

        <div className="products-admin-box">

          <div className="products-admin-header">

            <h3>
              All Orders
            </h3>

            <span>
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </span>

          </div>

          {/* =================================================
              NO ORDERS
          ================================================= */}

          {orders.length === 0 ? (

            <div className="no-products">

              <div>
                📦
              </div>

              <h3>
                No Orders Yet
              </h3>

              <p>
                Customer orders will appear here.
              </p>

            </div>

          ) : (

            <div className="admin-product-list">

              {orders.map((order) => (

                <div
                  className="admin-product-row"
                  key={order.id}
                >

                  {/* =================================================
                      ORDER + CUSTOMER
                  ================================================= */}

                  <div className="admin-product-name">

                    <strong>
                      Order #{order.id}
                    </strong>

                    <span>
                      {order.customer_name ||
                        "Customer"}
                    </span>

                    <small>
                      {formatDate(
                        order.created_at
                      )}
                    </small>

                  </div>

                  {/* =================================================
                      TOTAL
                  ================================================= */}

                  <div className="admin-product-price">

                    <strong>
                      ₹
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <div className="admin-product-stock">

                    <select
                      value={
                        order.status ||
                        "pending"
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className={`order-status-select ${getStatusClass(
                        order.status
                      )}`}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="packed">
                       Packed
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="out_for_delivery">
                      Out for Delivery
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>

                      <option value="failed">
                        Failed
                      </option>

                    </select>

                    <small>
                      {getStatusText(
                        order.status
                      )}
                    </small>

                  </div>

                  {/* =================================================
                      VIEW
                  ================================================= */}

                  <div className="admin-product-actions">

                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="edit-btn"
                    >
                      👁️ View
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminOrders;
