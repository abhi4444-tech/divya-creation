import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";

import "../css/newArrivals.css";

import ProductCard from "../components/ProductCard";
import { useNavigate, useLocation } from "react-router-dom";



const API_URL = import.meta.env.VITE_API_URL;


/* =====================================================
   NEW ARRIVALS
===================================================== */

function NewArrivals() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();


  /* =====================================================
     PRODUCTS
  ===================================================== */

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     SORT
  ===================================================== */

  const [sort, setSort] =
    useState("default");


  /* =====================================================
     WISHLIST
  ===================================================== */

  const [wishlist, setWishlist] =
    useState([]);


  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          setLoading(true);

          const response =
            await fetch(
              `${API_URL}/api/products?page=new-arrivals`
            );

          const data =
            await response.json();


          if (
            !response.ok ||
            !data.success
          ) {

            throw new Error(
              data.message ||
              "Products fetch failed"
            );

          }


          setProducts(
            data.products || []
          );


        } catch (error) {

          console.error(
            "New Arrivals fetch error:",
            error
          );

          setProducts([]);

        } finally {

          setLoading(false);

        }

      };


    fetchProducts();

  }, []);


  /* =====================================================
     FETCH WISHLIST FROM MYSQL
  ===================================================== */

useEffect(() => {
  let cancelled = false;

  const fetchWishlist = async () => {
    if (!user?.id) {
      setWishlist([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/${user.id}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Wishlist fetch failed"
        );
      }

      if (!cancelled) {
        setWishlist(data.products || []);
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);

      if (!cancelled) {
        setWishlist([]);
      }
    }
  };

  fetchWishlist();

  return () => {
    cancelled = true;
  };
}, [user?.id]);


  /* =====================================================
     ADD TO WISHLIST
  ===================================================== */

const addToWishlist = async (product) => {
  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: location.pathname },
    });
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    alert("Product ID not found.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/wishlist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(user.id),
        productId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Wishlist add failed");
    }

    const wishlistResponse = await fetch(
      `${API_URL}/api/wishlist/${user.id}`,
      { credentials: "include" }
    );

    const wishlistData = await wishlistResponse.json();

    if (!wishlistResponse.ok || !wishlistData.success) {
      throw new Error(
        wishlistData.message || "Wishlist refresh failed"
      );
    }

    setWishlist(wishlistData.products || []);

    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    console.error("Add Wishlist Error:", error);
    alert(error.message || "Unable to add product to wishlist.");
  }
};


  /* =====================================================
     REMOVE FROM WISHLIST
  ===================================================== */

  const removeFromWishlist = async (productId) => {
  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: location.pathname },
    });
    return;
  }

  const cleanProductId = Number(productId);

  if (!cleanProductId) {
    alert("Product ID not found.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/wishlist/${user.id}/${cleanProductId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Wishlist remove failed"
      );
    }

    setWishlist((prev) =>
      prev.filter((item) => Number(item.id) !== cleanProductId)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    console.error("Remove Wishlist Error:", error);
    alert(error.message || "Unable to remove product from wishlist.");
  }
};


  /* =====================================================
     ADD TO CART
  ===================================================== */

 const addToCart = async (product) => {
  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: location.pathname },
    });
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    alert("Product ID not found.");
    return;
  }

  if (Number(product?.stock || 0) <= 0) {
    alert("Product is out of stock.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(user.id),
        productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to add product to cart"
      );
    }

    alert("Product added to cart 🛒");
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Add Cart Error:", error);
    alert(error.message || "Unable to add product to cart.");
  }
};

/* =====================================================
   BUY NOW
===================================================== */
const buyNow = (product) => {
  if (Number(product?.stock || 0) <= 0) {
    alert("Product is out of stock.");
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    alert("Product ID not found.");
    return;
  }

  const checkoutPath = `/checkout?buyNow=${productId}`;

  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: checkoutPath },
    });
    return;
  }

  navigate(checkoutPath);
};


  /* =====================================================
     NEW ARRIVALS
  ===================================================== */

  const newArrivals = useMemo(() => {

  let result = products.filter((product) => {

    let productPages = product.pages;

    // Convert JSON string to array if needed
    if (typeof productPages === "string") {
      try {
        productPages = JSON.parse(productPages);
      } catch {
        productPages = [];
      }
    }

    // Make sure it is an array
    if (!Array.isArray(productPages)) {
      return false;
    }

    // Only products selected for New Arrivals
    return productPages.includes("new-arrivals");
  });

  // Maximum 6 products
  result = result.slice(0, 6);

  if (sort === "low") {
    result.sort(
      (a, b) =>
        Number(a.price) - Number(b.price)
    );
  }

  if (sort === "high") {
    result.sort(
      (a, b) =>
        Number(b.price) - Number(a.price)
    );
  }

  if (sort === "rating") {
    result.sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
  }

  return result;

}, [products, sort]);

  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <main className="new-arrivals-page">

      <section className="new-arrivals-container">


        {/* HERO */}

        <section className="new-arrivals-hero">

          <div className="new-arrivals-hero-content">

            <span>
              JUST ARRIVED
            </span>

            <h1>
              New Arrivals
            </h1>

            <p>
              Discover our latest
              jewellery collection
            </p>

          </div>

        </section>


        {/* TOOLBAR */}

        <section className="new-arrivals-toolbar">

          <div className="new-arrivals-count">

            {newArrivals.length}
            {" "}
            Products

          </div>


          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value
              )
            }
          >

            <option value="default">
              Recommended
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

            <option value="rating">
              Best Rated
            </option>

          </select>

        </section>


        {/* PRODUCTS */}

        <section className="new-arrivals-products">

          {loading ? (

            <div className="new-arrivals-loading">

              <div className="new-arrivals-spinner"></div>

              <p>
                Loading new arrivals...
              </p>

            </div>

          ) : newArrivals.length > 0 ? (

            <div className="new-arrivals-grid">

              {newArrivals.map(
                (product) => (

                  <ProductCard

                    key={
                      product.id
                    }

                    product={
                      product
                    }

                    addToCart={
                      addToCart
                    }

                    buyNow={
                      buyNow
                    }

                    wishlist={
                      wishlist
                    }

                    addToWishlist={
                      addToWishlist
                    }

                    removeFromWishlist={
                      removeFromWishlist
                    }

                  />

                )
              )}

            </div>

          ) : (

            <div className="new-arrivals-empty">

              <div>
                ⌕
              </div>

              <h3>
                No New Arrivals
              </h3>

              <p>
                Products added from your
                admin panel will appear here.
              </p>

            </div>

          )}

        </section>

      </section>

    </main>

  );

}


export default NewArrivals;
