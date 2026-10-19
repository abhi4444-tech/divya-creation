import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import "../css/Shop.css";
import "../css/wishlist.css";

import ProductCard from "../components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

function Wishlist() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  /* =====================================================
     WISHLIST STATE
  ===================================================== */

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD LOGGED-IN USER'S WISHLIST FROM MYSQL
  ===================================================== */

  
useEffect(() => {
  if (authLoading) return;

  let cancelled = false;

  const loadWishlist = async () => {
    try {
      setLoading(true);

      const userId = Number(user?.id);

      if (!userId) {
        setWishlist([]);
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/wishlist/${userId}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Wishlist load failed"
        );
      }

      if (!cancelled) {
        setWishlist(
          data.products || data.wishlist || []
        );
      }
    } catch (error) {
      console.error("Wishlist load error:", error);

      if (!cancelled) {
        setWishlist([]);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadWishlist();

  return () => {
    cancelled = true;
  };
}, [authLoading, user, navigate]);


  /* =====================================================
     ADD TO WISHLIST
  ===================================================== */

  const addToWishlist = async (product) => {
    try {
      const userId = Number(user?.id);
      const productId = Number(product?.id);

      if (!userId) {
        navigate("/login");
        return;
      }

      if (!productId) return;

      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not add product"
        );
      }

      // Refresh wishlist from the logged-in user's database records.
      const wishlistResponse = await fetch(
        `${API_URL}/api/wishlist/${userId}`,
        {
          credentials: "include"
        }
      );

      const wishlistData = await wishlistResponse.json();

      if (!wishlistResponse.ok || !wishlistData.success) {
        throw new Error("Could not refresh wishlist");
      }

      setWishlist(
        wishlistData.products || wishlistData.wishlist || []
      );

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Add wishlist error:", error);
      alert("Wishlist update nahi ho payi. Please try again.");
    }
  };

  /* =====================================================
     REMOVE FROM WISHLIST
  ===================================================== */

  const removeFromWishlist = async (productId) => {
    try {
      const userId = Number(user?.id);
      const cleanProductId = Number(productId);

      if (!userId) {
        setWishlist([]);
        navigate("/login");
        return;
      }

      const response = await fetch(
  `${API_URL}/api/wishlist/${userId}/${cleanProductId}`,
  {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  }
);

      const data = await response.json();

      if (!response.ok && response.status !== 404) {
        throw new Error(
          data.message || "Could not remove product"
        );
      }

      setWishlist((previous) =>
        previous.filter(
          (item) => Number(item.id) !== cleanProductId
        )
      );

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Remove wishlist error:", error);
      alert("Product remove nahi hua. Please try again.");
    }
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  
const addToCart = async (product) => {
  try {
    const userId = Number(user?.id);
    const productId = Number(product?.id);

    if (!userId) {
      navigate("/login");
      return;
    }

    if (!productId) {
      alert("Product ID not found.");
      return;
    }

    if (Number(product?.stock || 0) <= 0) {
      alert("Product is out of stock!");
      return;
    }

    const response = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add product to cart.");
    }

    window.dispatchEvent(new Event("cartUpdated"));
    alert("Product added to cart 🛒");
  } catch (error) {
    console.error("Add to cart error:", error);
    alert(error.message || "Unable to add product to cart.");
  }
};


  /* =====================================================
     BUY NOW
  ===================================================== */

  
const buyNow = (product) => {
  if (Number(product?.stock || 0) <= 0) {
    alert("Product is out of stock!");
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    alert("Product ID not found.");
    return;
  }

  if (!user?.id) {
    navigate("/login");
    return;
  }

  navigate(`/checkout?buyNow=${productId}`);
};


  /* =====================================================
     LOADING WISHLIST
  ===================================================== */

  if (loading) {
    return (
      <main className="divya-wishlist">
        <section className="wishlist-container">
          <p>Loading your wishlist...</p>
        </section>
      </main>
    );
  }

  /* =====================================================
     EMPTY WISHLIST
  ===================================================== */

  if (wishlist.length === 0) {
    return (
      <main className="divya-wishlist">
        <section className="wishlist-container">

          {/* PAGE BANNER */}

          <div className="wishlist-banner">
            <div className="wishlist-banner-content">
              <h1>My Wishlist</h1>

              <p>
                Your favourite jewellery collection
              </p>
            </div>
          </div>

          {/* BACK */}

          <button
            type="button"
            className="wishlist-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {/* EMPTY */}

          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              ♡
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save your favourite jewellery
              here and shop them anytime.
            </p>

            <button
              type="button"
              className="wishlist-shop-button"
              onClick={() => navigate("/shop")}
            >
              Explore Jewellery
            </button>
          </div>

        </section>
      </main>
    );
  }

  /* =====================================================
     NORMAL WISHLIST
  ===================================================== */

  return (
    <main className="divya-wishlist">
      <section className="wishlist-container">

        {/* BANNER */}

        <div className="wishlist-banner">
          <div className="wishlist-banner-content">
            <h1>My Wishlist</h1>

            <p>
              Your favourite jewellery collection
            </p>
          </div>
        </div>

        {/* TOP BAR */}

        <div className="wishlist-topbar">
          <button
            type="button"
            className="wishlist-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="wishlist-count">
            <span>❤️</span>

            {wishlist.length}{" "}

            {wishlist.length === 1 ? "Item" : "Items"}
          </div>
        </div>

        {/* PRODUCTS */}

        <section className="wishlist-products-section">
          <div className="jewellery-grid">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                buyNow={buyNow}
                wishlist={wishlist}
                addToWishlist={addToWishlist}
                removeFromWishlist={removeFromWishlist}
              />
            ))}
          </div>
        </section>

      </section>
    </main>
  );
}

export default Wishlist;