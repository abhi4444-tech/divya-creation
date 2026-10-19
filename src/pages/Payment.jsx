import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Payment.css";

const API_URL = import.meta.env.VITE_API_URL;

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const orderId = location.state?.orderId;

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);

  // LOAD ORDER FROM BACKEND — NO LOCALSTORAGE
  useEffect(() => {
    if (authLoading) return;

    if (!user?.id || !orderId) {
      navigate("/checkout", { replace: true });
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/orders/my-orders/${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load order");
        }

        const orders = Array.isArray(data)
          ? data
          : data.orders || data.data || [];

        const foundOrder = orders.find(
          (order) => String(order.id) === String(orderId)
        );

        if (!foundOrder) {
          throw new Error("Order not found. Please try checkout again.");
        }

        const orderItems = (foundOrder.items || []).map((item) => ({
          id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }));

        if (orderItems.length === 0) {
          throw new Error("No products found in this order.");
        }

        setCart(orderItems);
      } catch (error) {
        console.error("ORDER LOAD ERROR:", error);
        alert(error.message || "Unable to load your order.");
        navigate("/checkout", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [authLoading, user?.id, orderId, navigate]);

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const total = subtotal + delivery;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!user?.id || !orderId) {
      alert("Order information not found. Please try again.");
      navigate("/checkout");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      navigate("/checkout");
      return;
    }

    if (paymentMethod !== "cod") {
      alert(
        "Online payment is not configured yet. Please select Cash on Delivery."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/payment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentStatus: "pending",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order update failed");
      }

      alert("Order placed successfully! 🎉");

      navigate("/order-success", {
        state: {
          orderId,
          total,
        },
        replace: true,
      });
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      alert(
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  if (authLoading || loading) {
    return <div className="payment-page">Loading your order...</div>;
  }

  return (
    <div className="payment-page">
      {/* HEADER */}
      <header className="payment-header">
        <div
          className="payment-logo"
          onClick={() => navigate("/")}
        >
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <div className="payment-secure">
          🔒 Secure Payment
        </div>
      </header>

      {/* MAIN */}
      <main className="payment-container">
        <div className="payment-left">
          <div className="payment-title">
            <h2>Payment</h2>
            <p>Choose your preferred payment method</p>
          </div>

          {/* PAYMENT CARD */}
          <div className="payment-card">
            <h3>💳 Payment Method</h3>

            <form onSubmit={handlePayment}>
              {/* COD */}
              <label
                className={`payment-option ${
                  paymentMethod === "cod" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div className="payment-option-content">
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order arrives</span>
                </div>

                <span className="payment-icon">💵</span>
              </label>

              {/* UPI */}
              <label
                className={`payment-option ${
                  paymentMethod === "upi" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div className="payment-option-content">
                  <strong>UPI</strong>
                  <span>Google Pay, PhonePe, Paytm etc.</span>
                </div>

                <span className="payment-icon">📱</span>
              </label>

              {/* CARD */}
              <label
                className={`payment-option ${
                  paymentMethod === "card" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div className="payment-option-content">
                  <strong>Credit / Debit Card</strong>
                  <span>Visa, Mastercard, RuPay etc.</span>
                </div>

                <span className="payment-icon">💳</span>
              </label>

              {/* NET BANKING */}
              <label
                className={`payment-option ${
                  paymentMethod === "netbanking" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div className="payment-option-content">
                  <strong>Net Banking</strong>
                  <span>Pay using your bank account</span>
                </div>

                <span className="payment-icon">🏦</span>
              </label>

              {/* BUTTON */}
              <button
                type="submit"
                className="pay-now-btn"
              >
                Place Order • ₹{total}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="payment-right">
          <div className="payment-summary">
            <h3>Order Summary</h3>

            {/* PRODUCTS */}
            <div className="payment-products">
              {cart.map((item) => (
                <div
                  className="payment-product"
                  key={item.id}
                >
                  <div className="payment-product-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>🎁</span>
                    )}
                  </div>

                  <div className="payment-product-info">
                    <h4>{item.name}</h4>

                    <p>Qty: {item.quantity}</p>

                    <strong>
                      ₹
                      {Number(item.price) *
                        Number(item.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* PRICE */}
            <div className="payment-price">
              <div>
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div>
                <span>Delivery</span>
                <strong>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </strong>
              </div>

              <div className="payment-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Payment;