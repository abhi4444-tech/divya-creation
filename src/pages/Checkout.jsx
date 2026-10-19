import React, {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "../css/Checkout.css";


const API_URL =import.meta.env.VITE_API_URL;


const showAlert = (
  title,
  message = "",
  type = "error"
) => {

  alert(
    message
      ? `${title}\n${message}`
      : title
  );

};


function Checkout() {

  const navigate =
    useNavigate();

  const { user, loading: authLoading } = useAuth();


  const [searchParams] =
    useSearchParams();


  const [cart, setCart] =
    useState([]);


  const [loadingProduct, setLoadingProduct] =
    useState(false);


  const [form, setForm] =
    useState({

      name: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      pincode: "",

    });
const [addressLoaded, setAddressLoaded] = useState(false);
const [savingOrder, setSavingOrder] = useState(false);


  // =====================================================
  // LOAD CHECKOUT PRODUCTS
  // =====================================================

  
useEffect(() => {
  if (authLoading) return;

  let cancelled = false;

  const loadCheckoutProducts = async () => {
    setLoadingProduct(true);

    try {
      const buyNowId = Number(searchParams.get("buyNow"));

      // BUY NOW: product backend se load hoga
      if (buyNowId) {
        const response = await fetch(
          `${API_URL}/api/products/${buyNowId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.product) {
          throw new Error(
            data.message || "Product could not be loaded."
          );
        }

        const product = data.product;

        if (Number(product.stock || 0) <= 0) {
          showAlert("Product is out of stock.");
          navigate("/");
          return;
        }

        if (!cancelled) {
          setCart([{ ...product, quantity: 1 }]);
        }

        return;
      }

      // NORMAL CART: backend se load hoga
      if (!user?.id) {
        if (!cancelled) setCart([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/cart/${user.id}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load cart.");
      }

      if (!cancelled) {
        setCart(Array.isArray(data.cart) ? data.cart : []);
      }
    } catch (error) {
      console.error("Checkout Product Load Error:", error);

      if (!cancelled) {
        setCart([]);
        showAlert(
          "Unable to load product",
          error.message || "Something went wrong."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingProduct(false);
      }
    }
  };

  loadCheckoutProducts();

  return () => {
    cancelled = true;
  };
}, [searchParams, navigate, user?.id, authLoading]);


useEffect(() => {
  if (authLoading) return;

  if (!user?.id) {
    setAddressLoaded(true);
    return;
  }

  let cancelled = false;

  const loadSavedAddress = async () => {
    setAddressLoaded(false);

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${user.id}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Address load failed");
      }

      const addresses = Array.isArray(data)
        ? data
        : data.addresses || [];

      const saved =
        addresses.find((item) => Number(item.is_default) === 1) ||
        addresses[0];

      if (!cancelled && saved) {
        setForm({
          name: saved.recipient_name || "",
          mobile: saved.phone || "",
          address: [
            saved.address_line1,
            saved.address_line2,
            saved.landmark,
          ].filter(Boolean).join(", "),
          city: saved.city || "",
          state: saved.state || "",
          pincode: saved.pincode || "",
        });
      }
    } catch (error) {
      console.error("Address load error:", error);
    } finally {
      if (!cancelled) setAddressLoaded(true);
    }
  };

  loadSavedAddress();

  return () => {
    cancelled = true;
  };
}, [user?.id, authLoading]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,

    });

  };


  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal =
    cart.reduce(

      (total, item) =>

        total +
        Number(item.price || 0) *
        Number(item.quantity || 1),

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


const saveCheckoutAddress = async () => {
  const response = await fetch(
    `${API_URL}/api/addresses/${user.id}`,
    { credentials: "include" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load addresses");
  }

  const addresses = Array.isArray(data)
    ? data
    : data.addresses || [];

  const existing =
    addresses.find((item) => Number(item.is_default) === 1) ||
    addresses[0];

  const payload = {
    label: "Home",
    recipient_name: form.name.trim(),
    phone: form.mobile.trim(),
    address_line1: form.address.trim(),
    address_line2: "",
    landmark: "",
    city: form.city.trim(),
    state: form.state.trim(),
    pincode: form.pincode.trim(),
    is_default: 1,
  };

  const saveResponse = await fetch(
    existing
      ? `${API_URL}/api/addresses/edit/${existing.id}`
      : `${API_URL}/api/addresses`,
    {
      method: existing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  const result = await saveResponse.json();

  if (!saveResponse.ok || result.success === false) {
    throw new Error(result.message || "Address save failed");
  }
};


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();
      if (savingOrder) return;


      // ===================================================
      // CART CHECK
      // ===================================================

      if (
        cart.length === 0
      ) {

        showAlert(
          "Your Cart is Empty",
          "Please add some products before continuing.",
          "warning"
        );


        navigate("/cart");


        return;

      }


      // ===================================================
      // ADDRESS VALIDATION
      // ===================================================

      if (

        !form.name.trim() ||

        !form.mobile.trim() ||

        !form.address.trim() ||

        !form.city.trim() ||

        !form.state.trim() ||

        !form.pincode.trim()

      ) {

        showAlert(
          "Please fill all address details."
        );


        return;

      }


      // ===================================================
      // USER
      // ===================================================

      if (authLoading) {
  showAlert("Please wait", "Account is still loading.");
  return;
}

if (!user?.id) {
  navigate("/login", {
    state: { redirectTo: "/checkout" },
  });
  return;
}


      // ===================================================
      // PRODUCTS
      // ===================================================

      const orderItems =
        cart.map(
          (item) => ({

            productId:
              Number(item.id),

            name:
              item.name,

            price:
              Number(item.price),

            quantity:
              Number(
                item.quantity || 1
              ),

            image:
              item.image || "",

          })
        );


      console.log(
        "USER:",
        user
      );


      console.log(
        "CART:",
        cart
      );


      console.log(
        "ORDER ITEMS:",
        orderItems
      );


      console.log(
        "TOTAL:",
        total
      );


      // ===================================================
      // CREATE ORDER IN MYSQL
      // ===================================================

      try {
        setSavingOrder(true);
        await saveCheckoutAddress();

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },
              credentials: "include",

              body:
                JSON.stringify({

                  userId:
                    Number(user.id),

                  customerName:
                    form.name.trim(),

                  customerEmail:
                    user.email || "",

                  customerPhone:
                    form.mobile.trim(),

                  shippingAddress:
                    form.address.trim(),

                  city:
                    form.city.trim(),

                  state:
                    form.state.trim(),

                  pincode:
                    form.pincode.trim(),

                  paymentMethod:
                    "ONLINE",

                  items:
                    orderItems,

                  totalAmount:
                    Number(total),

                }),

            }
          );


        const data =
          await response.json();


        // =================================================
        // API ERROR
        // =================================================

        if (

          !response.ok ||

          !data.success

        ) {

          throw new Error(

            data.message ||
            "Failed to create order"

          );

        }


        // =================================================
        // ORDER CREATED
        // =================================================

        console.log(
          "Order created:",
          data.orderId
        );


        // =================================================
        // GO PAYMENT
        // =================================================

        showAlert(

          "Order created successfully!",

          "Continue to payment."

        );


        navigate(
          "/payment",
          {

            state: {

              orderId:
                data.orderId,

            },

          }
        );


      } catch (error) {

        console.error(

          "ORDER CREATE ERROR:",

          error

        );


        showAlert(

          "Order Failed",

          error.message ||
            "Something went wrong while creating your order."

        );

      }finally {
  setSavingOrder(false);
}

    };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="checkout-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="checkout-header">


        <div

          className="checkout-logo"

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


        <div className="secure-checkout">

          🔒 Secure Checkout

        </div>


      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="checkout-container">


        {/* =================================================
            LEFT
        ================================================= */}

        <div className="checkout-left">


          <div className="checkout-title">

            <h2>
              Checkout
            </h2>

            <p>
              Enter your delivery details
            </p>

          </div>


          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="checkout-card">


            <h3>
              📍 Delivery Address
            </h3>


            <form
              onSubmit={
                handleSubmit
              }
            >


              {/* =================================================
                  NAME + MOBILE
              ================================================= */}

              <div className="form-row">


                <div className="form-group">

                  <label>
                    Full Name
                  </label>


                  <input

                    type="text"

                    name="name"

                    placeholder="Enter your full name"

                    value={
                      form.name
                    }

                    onChange={
                      handleChange
                    }

                  />

                </div>


                <div className="form-group">

                  <label>
                    Mobile Number
                  </label>


                  <input

                    type="tel"

                    name="mobile"

                    placeholder="Enter mobile number"

                    value={
                      form.mobile
                    }

                    onChange={
                      handleChange
                    }

                  />

                </div>


              </div>


              {/* =================================================
                  ADDRESS
              ================================================= */}

              <div className="form-group">


                <label>
                  Complete Address
                </label>


                <textarea

                  name="address"

                  placeholder="House no., Street, Area"

                  value={
                    form.address
                  }

                  onChange={
                    handleChange
                  }

                  rows="4"

                />


              </div>


              {/* =================================================
                  CITY + STATE
              ================================================= */}

              <div className="form-row">


                <div className="form-group">

                  <label>
                    City
                  </label>


                  <input

                    type="text"

                    name="city"

                    placeholder="Enter city"

                    value={
                      form.city
                    }

                    onChange={
                      handleChange
                    }

                  />

                </div>


                <div className="form-group">

                  <label>
                    State
                  </label>


                  <input

                    type="text"

                    name="state"

                    placeholder="Enter state"

                    value={
                      form.state
                    }

                    onChange={
                      handleChange
                    }

                  />

                </div>


              </div>


              {/* =================================================
                  PINCODE
              ================================================= */}

              <div className="form-group">


                <label>
                  Pincode
                </label>


                <input

                  type="text"

                  name="pincode"

                  placeholder="6 digit pincode"

                  value={
                    form.pincode
                  }

                  onChange={
                    handleChange
                  }

                />


              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button

                type="submit"

                className="save-address-btn"

                disabled={loadingProduct || !addressLoaded || savingOrder}

              >

                {savingOrder ? "Saving order..." : "Save Address & Continue"}

              </button>


            </form>


          </div>


        </div>


        {/* =================================================
            RIGHT - ORDER SUMMARY
        ================================================= */}

        <div className="checkout-right">


          <div className="order-summary">


            <h3>
              Order Summary
            </h3>


            {/* =================================================
                LOADING BUY NOW PRODUCT
            ================================================= */}

            {loadingProduct ? (

              <div className="empty-checkout">

                <p>
                  Loading product...
                </p>

              </div>

            ) : cart.length === 0 ? (

              <div className="empty-checkout">

                <p>
                  Your cart is empty.
                </p>


                <button
                  onClick={() =>
                    navigate("/")
                  }
                >

                  Continue Shopping

                </button>


              </div>

            ) : (

              <>


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div className="checkout-products">


                  {cart.map(
                    (item) => (

                      <div

                        className="checkout-product"

                        key={
                          item.id
                        }

                      >


                        <div className="checkout-product-image">


                          {item.image ? (

                            <img

                              src={
                                item.image
                              }

                              alt={
                                item.name
                              }

                            />

                          ) : (

                            <span>
                              🎁
                            </span>

                          )}


                        </div>


                        <div className="checkout-product-info">


                          <h4>
                            {
                              item.name
                            }
                          </h4>


                          <p>
                            Qty: {
                              item.quantity
                            }
                          </p>


                          <strong>

                            ₹

                            {
                              Number(
                                item.price
                              ) *
                              Number(
                                item.quantity ||
                                1
                              )
                            }

                          </strong>


                        </div>


                      </div>

                    )
                  )}


                </div>


                {/* =================================================
                    PRICE DETAILS
                ================================================= */}

                <div className="price-details">


                  <div>

                    <span>
                      Subtotal
                    </span>


                    <strong>
                      ₹{subtotal}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Delivery
                    </span>


                    <strong>

                      {
                        delivery === 0

                          ? "FREE"

                          : `₹${delivery}`

                      }

                    </strong>

                  </div>


                  <div className="total-row">

                    <span>
                      Total
                    </span>


                    <strong>
                      ₹{total}
                    </strong>

                  </div>


                </div>


              </>

            )}


          </div>


        </div>


      </div>


    </div>

  );

}


export default Checkout;
