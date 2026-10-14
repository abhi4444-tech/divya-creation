import { useNavigate, useLocation } from "react-router-dom";
import "../css/OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

const orderId = location.state?.orderId;
const total = location.state?.total ?? "0";

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h1>Order Placed!</h1>

        <p className="success-message">
          Thank you for shopping with Divya Creation.
        </p>

        <div className="order-info">
          <div>
            <span>Order ID</span>
            <strong>{orderId || "Not available"}</strong>
          </div>

          <div>
            <span>Total Amount</span>
            <strong>₹{total}</strong>
          </div>
        </div>

        <p className="delivery-message">
          Your order has been successfully placed.
        </p>

        <div className="success-buttons">
          <button
            onClick={() => navigate("/my-orders")}
          >
            Track Order
          </button>

          <button
            className="continue-shopping"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;