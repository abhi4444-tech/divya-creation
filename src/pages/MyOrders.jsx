import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/MyOrders.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // =====================================================
  // STATES
  // =====================================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  
const [trackingOrderId, setTrackingOrderId] = useState(
  new URLSearchParams(location.search).get("track")
);

useEffect(() => {
  const requestedOrderId =
    new URLSearchParams(location.search).get("track");

  if (requestedOrderId) {
    setTrackingOrderId(requestedOrderId);
  }
}, [location.search]);


  // IMPORTANT:
  // activeFilter component ke ANDAR hona chahiye
  const [activeFilter, setActiveFilter] = useState("all");


  // =====================================================
  // FETCH MY ORDERS
  // =====================================================

  
useEffect(() => {
  // Auth check complete hone ka wait karo.
  if (authLoading) return;

  const fetchOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      navigate("/login", {
        state: { from: location },
      });
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("LOGGED USER:", user);

      const response = await fetch(
        `${API_URL}/api/orders/my-orders/${user.id}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("MY ORDERS RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("MY ORDERS ERROR:", err);

      setError(
        err.message || "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [authLoading, user, navigate, location]);



  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = orders.filter(
    (order) => {
      // ALL
      if (activeFilter === "all") {
        return true;
      }

      // STATUS FILTER
      return (
        String(order.status || "")
          .toLowerCase() ===
        activeFilter.toLowerCase()
      );
    }
  );


  // =====================================================
  // STATUS TEXT
  // =====================================================

  
const getStatusText = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const labels = {
    pending: "Order Pending",
    confirmed: "Order Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    failed: "Payment Failed",
    cancelled: "Cancelled",
  };

  return labels[normalized] || status || "Unknown";
};



  // =====================================================
  // STATUS CLASS
  // =====================================================

  
const getStatusClass = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const allowed = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "failed",
    "cancelled",
  ];

  return allowed.includes(normalized)
    ? normalized
    : "pending";
};



  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // =====================================================
  // FILTER BUTTON
  // =====================================================

  const FilterButton = ({
    value,
    children,
  }) => {
    return (
      <button
        type="button"
        className={
          activeFilter === value
            ? "active"
            : ""
        }
        onClick={() =>
          setActiveFilter(value)
        }
      >
        {children}
      </button>
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-loading">

          <div className="loading-spinner">
            ⏳
          </div>

          <p>
            Loading your orders...
          </p>

        </div>
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="my-orders-page">

        <div className="my-orders-error">

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================


const trackingSteps = [
  {
    status: "confirmed",
    title: "Order Confirmed",
    description: "Your order has been placed.",
  },
  {
    status: "packed",
    title: "Packed",
    description: "Your parcel is packed.",
  },
  {
    status: "shipped",
    title: "Shipped",
    description: "Your parcel is on its way.",
  },
  {
    status: "out_for_delivery",
    title: "Out for Delivery",
    description: "Delivery agent will bring your parcel.",
  },
  {
    status: "delivered",
    title: "Delivered",
    description: "Order delivered to the customer.",
  },
];

const getTrackingProgress = (status) => {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalizedStatus === "pending") return -1;
  if (normalizedStatus === "confirmed") return 0;
  if (normalizedStatus === "packed") return 1;
  if (normalizedStatus === "shipped") return 2;
  if (normalizedStatus === "out_for_delivery") return 3;
  if (normalizedStatus === "delivered") return 4;

  return -1;
};



  return (
    <div className="my-orders-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="my-orders-header">

        <div>

          <h1>
            My Orders
          </h1>

          <p>
            Track and manage all your orders
          </p>

        </div>


        <div className="order-count">

          {orders.length}{" "}

          {orders.length === 1
            ? "Order"
            : "Orders"}

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="order-filters">

        <FilterButton value="all">
          All
        </FilterButton>

        <FilterButton value="pending">
          Pending
        </FilterButton>

        <FilterButton value="confirmed">
          Confirmed
        </FilterButton>
        
<FilterButton value="packed">
  Packed
</FilterButton>


        <FilterButton value="shipped">
          Shipped
        </FilterButton>

<FilterButton value="out_for_delivery">
  Out for Delivery
</FilterButton>


        <FilterButton value="delivered">
          Delivered
        </FilterButton>

        <FilterButton value="cancelled">
          Cancelled
        </FilterButton>

        <FilterButton value="failed">
          Failed
        </FilterButton>

      </div>


      {/* =================================================
          NO ORDERS AT ALL
      ================================================= */}

      {orders.length === 0 && (
        <div className="no-orders">

          <div className="no-orders-icon">
            📦
          </div>

          <h2>
            No Orders Yet
          </h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            Start Shopping
          </button>

        </div>
      )}


      {/* =================================================
          FILTERED RESULT EMPTY
      ================================================= */}

      {orders.length > 0 &&
        filteredOrders.length === 0 && (

          <div className="no-orders">

            <div className="no-orders-icon">
              📦
            </div>

            <h2>
              No {getStatusText(activeFilter)}
            </h2>

            <p>
              You don't have any orders in this
              category.
            </p>

            <button
              type="button"
              onClick={() =>
                setActiveFilter("all")
              }
            >
              View All Orders
            </button>

          </div>

        )}


      {/* =================================================
          ORDERS LIST
      ================================================= */}

      {filteredOrders.length > 0 && (

        <div className="orders-list">

          {filteredOrders.map((order) => (

            <div
              className="order-card"
              key={order.id}
            >


              {/* =================================================
                  ORDER HEADER
              ================================================= */}

              <div className="order-card-header">

                <div>

                  <strong>
                    Order #{order.id}
                  </strong>

                  <span>
                    Placed on{" "}
                    {formatDate(
                      order.created_at
                    )}
                  </span>

                </div>


                <div
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >

                  {getStatusText(
                    order.status
                  )}

                </div>

              </div>


              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="order-products">

                {Array.isArray(order.items) &&
                  order.items.map(
                    (item, index) => (

                      <div
                        className="order-product"
                        key={
                          item.id ||
                          `${order.id}-${index}`
                        }
                      >


                        {/* IMAGE */}

                        <div className="order-product-image">

                          {item.product_image ? (

                            <img
                              src={
                                item.product_image
                              }
                              alt={
                                item.product_name ||
                                "Product"
                              }
                            />

                          ) : (

                            <span>
                              🎁
                            </span>

                          )}

                        </div>


                        {/* PRODUCT INFO */}

                        <div className="order-product-info">

                          <h3>
                            {item.product_name ||
                              "Product"}
                          </h3>

                          <p>
                            Qty:{" "}
                            {item.quantity || 1}
                          </p>

                          <strong>
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>

                      </div>

                    )
                  )}

              </div>


              {/* =================================================
                  ORDER FOOTER
              ================================================= */}

              <div className="order-card-footer">


                {/* TOTAL */}

                <div>

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>


                {/* PAYMENT METHOD */}

                <div>

                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.payment_method ||
                      "COD"}
                  </strong>

                </div>


                {/* PAYMENT STATUS */}

                <div>

                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {order.payment_status ||
                      "pending"}
                  </strong>

                </div>

              </div>
  <button
  type="button"
  className="track-order-btn"
  onClick={() =>
    setTrackingOrderId(
      trackingOrderId === order.id ? null : order.id
    )
  }
>
  {trackingOrderId === order.id
    ? "Hide Tracking"
    : "Track Order"}
</button>

{trackingOrderId === order.id && (
  <div className="order-tracking-panel">
    <h3>Delivery progress</h3>

    <div className="tracking-order-number">
      Order #{order.order_number || order.orderNumber || order.id}
    </div>

    {["cancelled", "failed"].includes(
      String(order.status || "").toLowerCase()
    ) ? (
      <div className="tracking-error">
        {String(order.status).toLowerCase() === "cancelled"
          ? "This order has been cancelled."
          : "Payment failed for this order."}
      </div>
    ) : (
      <div className="tracking-timeline">
        {trackingSteps.map((step, index) => {
          const progress = getTrackingProgress(order.status);
          const isCompleted = index <= progress;
          const isCurrent = index === progress;

          return (
            <div
              className={`tracking-step ${
                isCompleted ? "completed" : ""
              } ${isCurrent ? "current" : ""}`}
              key={step.status}
            >
              <div className="tracking-step-indicator">
                {isCompleted ? "✓" : ""}
              </div>

              <div className="tracking-step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>

                {isCurrent && (
                  <span className="tracking-current-label">
                    Current status
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

            </div>

          ))}


        </div>

      )}

    </div>
  );
}

export default MyOrders;
