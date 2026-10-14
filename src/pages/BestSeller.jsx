import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  SlidersHorizontal,
} from "lucide-react";

import "../css/bestSeller.css";
import ProductCard from "../components/ProductCard";

const API_URL = "http://localhost:5000";


/* =====================================================
   BEST SELLER
   SAME PRODUCT CARD AS SHOP PAGE
===================================================== */

function BestSeller() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sort, setSort] =
    useState("default");

  const [showFilter, setShowFilter] =
    useState(false);

  const [wishlist, setWishlist] = useState([]);

  

useEffect(() => {
  if (!user?.id) {
    setWishlist([]);
    return;
  }

  let cancelled = false;

  const loadWishlist = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/${user.id}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Wishlist load failed");
      }

      if (!cancelled) {
        setWishlist(data.products || data.wishlist || []);
      }
    } catch (error) {
      console.error("BestSeller wishlist load error:", error);
    }
  };

  const handleWishlistUpdate = () => {
    loadWishlist();
  };

  loadWishlist();

  window.addEventListener("wishlistUpdated", handleWishlistUpdate);

  return () => {
    cancelled = true;
    window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  };
}, [user?.id]);



  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/products`
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
          "Products fetch error:",
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
     WISHLIST
     SAME AS SHOP
  ===================================================== */



const addToWishlist = async (product) => {
  try {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const productId = Number(product?.id);
    if (!productId) return;

    const response = await fetch(`${API_URL}/api/wishlist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        productId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add product");
    }

    const wishlistResponse = await fetch(
      `${API_URL}/api/wishlist/${user.id}`,
      { credentials: "include" }
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




  

const removeFromWishlist = async (productId) => {
  try {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const cleanProductId = Number(productId);

    const response = await fetch(
      `${API_URL}/api/wishlist/${user.id}/${cleanProductId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not remove product");
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
     SAME AS SHOP
  ===================================================== */

  
const addToCart = async (product) => {
  try {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (!product?.id) return;

    if (Number(product.stock) <= 0) {
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
        userId: user.id,
        productId: product.id,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add product to cart");
    }

    window.dispatchEvent(new Event("cartUpdated"));
    alert(data.message || "Product added to cart!");
  } catch (error) {
    console.error("Add to Cart Error:", error);
    alert(error.message || "Unable to add product to cart.");
  }
};



  /* =====================================================
     BUY NOW
     SAME AS SHOP
  ===================================================== */

  
const buyNow = async (product) => {
  try {
    if (!user?.id) {
      navigate("/login", {
        state: { redirectTo: "/checkout" },
      });
      return;
    }

    if (!product?.id) return;

    if (Number(product.stock) <= 0) {
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
        userId: user.id,
        productId: product.id,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not process Buy Now");
    }

    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/checkout");
  } catch (error) {
    console.error("Buy Now Error:", error);
    alert(error.message || "Unable to proceed to checkout.");
  }
};



  /* =====================================================
     SORT
  ===================================================== */

  const sortedProducts =
    useMemo(() => {

      const result = [
        ...products,
      ];


      if (sort === "low") {

        result.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );

      }


      if (sort === "high") {

        result.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );

      }


      if (sort === "rating") {

        result.sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        );

      }


      return result;

    }, [
      products,
      sort,
    ]);


  /* =====================================================
     BEST SELLERS ONLY
     
     If your API marks products with
     badge: "BEST SELLER", only those
     products will appear.
     
     If there are no BEST SELLER badges,
     all products are displayed.
  ===================================================== */

  const bestSellerProducts =
    useMemo(() => {

      const markedProducts =
        products.filter(
          (product) =>
            product.badge ===
            "BEST SELLER"
        );


      return markedProducts.length > 0
        ? markedProducts
        : products;

    }, [
      products,
    ]);


  /* =====================================================
     SORT BEST SELLERS
  ===================================================== */

  const finalProducts =
    useMemo(() => {

      const result = [
        ...bestSellerProducts,
      ];


      if (sort === "low") {

        result.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );

      }


      if (sort === "high") {

        result.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );

      }


      if (sort === "rating") {

        result.sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        );

      }


      return result;

    }, [
      bestSellerProducts,
      sort,
    ]);


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <main className="best-seller-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bs-hero">

        <div className="bs-hero-content">

          <span>
            OUR CUSTOMERS' FAVOURITES
          </span>

          <h2>
            Best Sellers
          </h2>

          <p>
            Discover the jewellery
            everyone is loving right now
          </p>

        </div>

      </section>


      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="bs-toolbar">

        <button
          type="button"
          className="bs-filter-button"
          onClick={() =>
            setShowFilter(
              (prev) => !prev
            )
          }
        >

          <SlidersHorizontal
            size={17}
          />

          Filters

        </button>


        <div className="bs-sort">

          <span>
            Sort By
          </span>


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

        </div>

      </section>


      {/* =================================================
          FILTER BOX
      ================================================= */}

      {showFilter && (

        <div className="bs-filter-box">

          <button
            type="button"
          >
            All Products
          </button>

          <button
            type="button"
          >
            Nath
          </button>

          <button
            type="button"
          >
            Mangalsutra
          </button>

          <button
            type="button"
          >
            Necklace
          </button>

          <button
            type="button"
          >
            Rani Haar
          </button>

          <button
            type="button"
          >
            Mundavlya
          </button>

          <button
            type="button"
          >
            Ear Needle
          </button>

          <button
            type="button"
          >
            Hairpin
          </button>

          <button
            type="button"
          >
            Pearl Mala
          </button>

        </div>

      )}


      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section className="bs-product-section">

        {loading ? (

          <div className="bs-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading jewellery...
            </p>

          </div>

        ) : finalProducts.length > 0 ? (

          <div className="jewellery-grid">

            {finalProducts.map(
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

          <div className="bs-empty">

            <div>
              ⌕
            </div>

            <h3>
              No Jewellery Found
            </h3>

            <p>
              Products added from your
              admin panel will appear here.
            </p>

          </div>

        )}

      </section>

    </main>

  );

}


export default BestSeller;
