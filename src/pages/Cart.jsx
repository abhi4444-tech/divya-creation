import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../css/cart.css";


const API_URL = "http://localhost:5000";


function Cart() {

  const navigate =
    useNavigate();



  const [cart, setCart] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);


  // =====================================================
  // GET LOGGED USER
  // =====================================================

const { user, loading: authLoading } = useAuth();


  // =====================================================
  // LOAD CART
  // =====================================================

useEffect(() => {
  if (authLoading) return;

  let cancelled = false;

  const fetchCart = async () => {
    if (!user?.id) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/cart/${user.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
  throw new Error(
    data.message || "Cart fetch failed"
  );
}

      if (!cancelled) {
        // Apne backend ke existing response format ke according
        // cart data set karna hai.
        setCart(
  Array.isArray(data.cart) ? data.cart : []
);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);

      if (!cancelled) {
        setCart([]);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchCart();

  return () => {
    cancelled = true;
  };
}, [authLoading, user]);


  // =====================================================
  // CHECKOUT
  // =====================================================

  
const handleCheckout = () => {
  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: "/checkout" },
    });
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  navigate("/checkout");
};



  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity =
    async (productId, change) => {

      try {

        if (!user?.id) {

          navigate("/login");

          return;

        }


        const item =
          cart.find(
            (cartItem) =>
              Number(cartItem.id) ===
              Number(productId)
          );


        if (!item) {
          return;
        }


        const currentQuantity =
          Number(
            item.quantity || 1
          );


        const newQuantity =
          currentQuantity + change;


        // Prevent below 1

        if (newQuantity < 1) {
          return;
        }


        // Prevent above stock

        if (
          Number(item.stock) > 0 &&
          newQuantity >
            Number(item.stock)
        ) {

          alert(
            `Only ${item.stock} item(s) available in stock.`
          );

          return;

        }


        setUpdatingId(productId);


        const response =
          await fetch(
            `${API_URL}/api/cart/${user.id}/${productId}`,
            {
              method: "PUT",
              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                quantity:
                  newQuantity,
              }),

            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Quantity update failed"
          );

        }


        // Update UI

        setCart(
          (prev) =>
            prev.map(
              (cartItem) =>
                Number(cartItem.id) ===
                Number(productId)
                  ? {
                      ...cartItem,
                      quantity:
                        newQuantity,
                    }
                  : cartItem
            )
        );


      } catch (error) {

        console.error(
          "Update Cart Error:",
          error
        );


        alert(
          error.message ||
          "Unable to update quantity."
        );

      } finally {

        setUpdatingId(null);

      }

    };


  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem =
    async (productId) => {

      try {


        if (!user?.id) {

          navigate("/login");

          return;

        }


        setUpdatingId(productId);


        const response =
          await fetch(
            `${API_URL}/api/cart/${user.id}/${productId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Remove cart item failed"
          );

        }


        setCart(
          (prev) =>
            prev.filter(
              (item) =>
                Number(item.id) !==
                Number(productId)
            )
        );


      } catch (error) {

        console.error(
          "Remove Cart Error:",
          error
        );


        alert(
          error.message ||
          "Unable to remove product."
        );

      } finally {

        setUpdatingId(null);

      }

    };


  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );


  // =====================================================
  // DELIVERY
  // =====================================================

  const delivery =
    subtotal >= 999 ||
    subtotal === 0
      ? 0
      : 49;


  // =====================================================
  // TOTAL
  // =====================================================

  const total =
    subtotal + delivery;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading || authLoading) {

    return (

      <div className="cart-page">

        <header className="cart-header">

          <div
            className="cart-logo"
            onClick={() =>
              navigate("/")
            }
          >

            <h1>
              Divya
            </h1>

            <span>
              CREATION
            </span>

          </div>


          <h2>
            Shopping Cart
          </h2>

        </header>


        <main className="cart-container">

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Loading Cart...
            </h2>

            <p>
              Please wait while we load your cart.
            </p>

          </div>

        </main>

      </div>

    );

  }


  // =====================================================
  // NOT LOGGED IN
  // =====================================================
  if (!user?.id) {

    return (

      <div className="cart-page">

        <header className="cart-header">

          <div
            className="cart-logo"
            onClick={() =>
              navigate("/")
            }
          >

            <h1>
              Divya
            </h1>

            <span>
              CREATION
            </span>

          </div>


          <h2>
            Shopping Cart
          </h2>

        </header>


        <main className="cart-container">

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🔐
            </div>

            <h2>
              Please Login
            </h2>

            <p>
              Login to view your shopping cart.
            </p>


            <button
              onClick={() =>
                navigate("/login")
              }
              className="continue-shopping-btn"
            >
              Login
            </button>

          </div>

        </main>

      </div>

    );

  }


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="cart-page">


      {/* HEADER */}

      <header className="cart-header">

        <div
          className="cart-logo"
          onClick={() =>
            navigate("/")
          }
        >

          <h1>
            Divya
          </h1>

          <span>
            CREATION
          </span>

        </div>


        <h2>
          Shopping Cart
        </h2>

      </header>


      {/* MAIN */}

      <main className="cart-container">


        {/* LEFT */}

        <div className="cart-products">

          <h2>
            Your Cart
          </h2>


          {cart.length === 0 ? (

            <div className="empty-cart">

              <div className="empty-cart-icon">
                🛒
              </div>


              <h2>
                Your Cart is Empty
              </h2>


              <p>
                You haven't added any product yet.
              </p>


              <button
                onClick={() =>
                  navigate("/")
                }
                className="continue-shopping-btn"
              >
                Continue Shopping
              </button>

            </div>

          ) : (

            cart.map((item) => (

              <div
                className="cart-item"
                key={item.id}
              >


                {/* IMAGE */}

                <div className="cart-item-image">

                  {item.image ? (

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                  ) : (

                    <span>
                      🎁
                    </span>

                  )}

                </div>


                {/* INFO */}

                <div className="cart-item-info">

                  <h3>
                    {item.name}
                  </h3>


                  <p className="cart-item-price">

                    ₹
                    {Number(
                      item.price || 0
                    )}

                  </p>


                  {/* QUANTITY */}

                  <div className="quantity">

                    <button
                      disabled={
                        updatingId ===
                        item.id
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      −
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      disabled={
                        updatingId ===
                        item.id
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      +
                    </button>

                  </div>


                  {/* STOCK */}

                  {Number(item.stock) > 0 && (

                    <small>
                      {item.stock} available
                    </small>

                  )}


                  {/* REMOVE */}

                  <button
                    className="remove-btn"
                    disabled={
                      updatingId ===
                      item.id
                    }
                    onClick={() =>
                      removeItem(
                        item.id
                      )
                    }
                  >
                    🗑 Remove
                  </button>

                </div>


                {/* ITEM TOTAL */}

                <div className="item-total">

                  ₹
                  {(
                    Number(
                      item.price || 0
                    ) *
                    Number(
                      item.quantity || 0
                    )
                  ).toFixed(0)}

                </div>


              </div>

            ))

          )}

        </div>


        {/* RIGHT */}

        {cart.length > 0 && (

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(0)}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Delivery
              </span>


              <strong
                className={
                  delivery === 0
                    ? "free-delivery"
                    : ""
                }
              >

                {delivery === 0
                  ? "FREE"
                  : `₹${delivery}`}

              </strong>

            </div>


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹{total.toFixed(0)}
              </strong>

            </div>


            {/* CHECKOUT */}

            <button
              className="checkout-btn"
              onClick={
                handleCheckout
              }
            >
              Proceed to Checkout
            </button>


            {/* CONTINUE */}

            <button
              className="continue-btn"
              onClick={() =>
                navigate("/")
              }
            >
              Continue Shopping
            </button>


            <p className="secure-text">
              🔒 Safe & Secure Checkout
            </p>

          </aside>

        )}

      </main>

    </div>

  );

}


export default Cart;
