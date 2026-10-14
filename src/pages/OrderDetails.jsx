import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../css/OrderDetails.css";

const API_URL = "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ORDER DETAILS
  // =====================================================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders/admin/all`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load order"
          );
        }

        // URL id ko database id se match karo
        const foundOrder = (data.orders || []).find(
          (item) => String(item.id) === String(id)
        );

        if (!foundOrder) {
          setError("Order not found");
          setOrder(null);
          return;
        }

        setOrder(foundOrder);

      } catch (err) {
        console.error(
          "ORDER DETAILS ERROR:",
          err
        );

        setError(
          err.message || "Failed to load order"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-dashboard">

        <main className="admin-main">

          <h2>Loading Order...</h2>

          <p>
            Please wait while order details are loading.
          </p>

        </main>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <div className="admin-dashboard">

        <main className="admin-main">

          <h2>Order Not Found</h2>

          <p>
            {error || "This order could not be found."}
          </p>

          <Link
            to="/admin/orders"
            className="add-product-button"
          >
            ← Back to Orders
          </Link>

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

          <span>
            CREATION
          </span>

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


        {/* =================================================
            TOP
        ================================================= */}

        <div className="admin-top">

          <div>

            <h2>
              Order Details
            </h2>

            <p>
              Order #{order.id}
            </p>

          </div>


          <Link
            to="/admin/orders"
            className="add-product-button"
          >
            ← Back to Orders
          </Link>

        </div>


        <div className="admin-orders">

          <div className="admin-order-card">


            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <h3>
              👤 Customer Details
            </h3>


            <p>
              <strong>Name:</strong>{" "}
              {order.customer_name || "Not available"}
            </p>


            <p>
              <strong>Email:</strong>{" "}
              {order.customer_email || "Not available"}
            </p>


            <p>
              <strong>Mobile:</strong>{" "}
              {order.customer_phone || "Not available"}
            </p>


            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <h3>
              🏠 Delivery Address
            </h3>


            <p>
              {order.shipping_address || ""}
              {order.city
                ? `, ${order.city}`
                : ""}
              {order.state
                ? `, ${order.state}`
                : ""}
              {order.pincode
                ? ` - ${order.pincode}`
                : ""}
            </p>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <h3>
              🛍️ Products
            </h3>


            <div className="admin-order-products">

              {order.items &&
              order.items.length > 0 ? (

                order.items.map((product) => (

                  <div
                    className="admin-order-product"
                    key={product.id}
                  >


                    {/* IMAGE */}

                    <div className="order-product-image">

                      {product.product_image ? (

                        <img
                          src={product.product_image}
                          alt={product.product_name}
                        />

                      ) : (

                        <span>
                          🎁
                        </span>

                      )}

                    </div>


                    {/* NAME */}

                    <div className="order-product-name">

                      <strong>
                        {product.product_name}
                      </strong>

                      <small>
                        Product ID:{" "}
                        {product.product_id}
                      </small>

                    </div>


                    {/* QUANTITY */}

                    <div className="order-product-qty">

                      Qty:{" "}
                      {product.quantity}

                    </div>


                    {/* PRICE */}

                    <div className="order-product-price">

                      ₹
                      {(
                        Number(product.price) *
                        Number(product.quantity)
                      ).toLocaleString("en-IN")}

                    </div>

                  </div>

                ))

              ) : (

                <p>
                  No products found.
                </p>

              )}

            </div>


            {/* =================================================
                PAYMENT
            ================================================= */}

            <h3>
              💳 Payment / Order Summary
            </h3>


            <p>
              <strong>
                Payment Method:
              </strong>{" "}
              {order.payment_method || "COD"}
            </p>


            <p>
              <strong>
                Payment Status:
              </strong>{" "}
              {order.payment_status || "pending"}
            </p>


            {/* =================================================
                TOTAL
            ================================================= */}

            <p>
              <strong>
                Total Amount:
              </strong>{" "}
              ₹
              {Number(
                order.total_amount || 0
              ).toLocaleString("en-IN")}
            </p>


            {/* =================================================
                ORDER STATUS
            ================================================= */}

            <p>
              <strong>
                Order Status:
              </strong>{" "}

              <span className="stock-available">
                {order.status || "pending"}
              </span>

            </p>


            {/* =================================================
                ORDER DATE
            ================================================= */}

            <p>

              <strong>
                Order Date:
              </strong>{" "}

              {order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleString("en-IN")
                : "Not available"}

            </p>


          </div>

        </div>

      </main>

    </div>
  );
}

export default OrderDetails;
