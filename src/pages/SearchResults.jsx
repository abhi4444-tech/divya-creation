import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../css/searchResults.css";

import ProductCard from "../components/ProductCard";

const API_URL = "http://localhost:5000";

const showAlert = (title, message = "") =>
  alert(message ? `${title}\n${message}` : title);

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const searchQuery = searchParams.get("query") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [sortBy, setSortBy] = useState("relevance");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [priceRange, setPriceRange] =
    useState("all");

  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  /* =====================================================
     LOAD PRODUCTS FROM DATABASE
  ===================================================== */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/products`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Products fetch failed"
          );
        }

        setAllProducts(
          Array.isArray(data.products)
            ? data.products
            : []
        );
      } catch (error) {
        console.error(
          "Search products error:",
          error
        );

        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* =====================================================
     LOAD WISHLIST FROM DATABASE
  ===================================================== */

  useEffect(() => {
  if (authLoading) return;

  const loadWishlist = async () => {
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
        throw new Error(data.message || "Wishlist fetch failed");
      }

      setWishlist(
        Array.isArray(data.products) ? data.products : []
      );
    } catch (error) {
      console.error("Load wishlist error:", error);
      setWishlist([]);
    }
  };

  loadWishlist();
}, [user?.id, authLoading]);

  /* =====================================================
     ADD TO WISHLIST
  ===================================================== */

  const addToWishlist = async (product) => {
    try {
      setWishlistLoading(true);

      
const userId = Number(user?.id);

if (!userId) {
  showAlert(
    "Please login",
    "Please login to add products to wishlist."
  );
  return;
}


      const productId =
        Number(product?.id);

      if (!userId || !productId) {
        showAlert(
          "Wishlist Error",
          "Invalid user or product."
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/api/wishlist`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
  productId,
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
            "Wishlist add failed"
        );
      }

      setWishlist((prev) => {
        const exists =
          prev.some(
            (item) =>
              Number(item.id) ===
              productId
          );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          product,
        ];
      });
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      showAlert(
        "Wishlist Error",
        error.message ||
          "Unable to add product."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  /* =====================================================
     REMOVE FROM WISHLIST
  ===================================================== */

  const removeFromWishlist =
    async (productId) => {
      try {
        setWishlistLoading(true);

        
const userId = Number(user?.id);

if (!userId) {
  showAlert("Please login", "Please login first.");
  return;
}


        const cleanProductId =
          Number(productId);

        if (
          !userId ||
          !cleanProductId
        ) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/wishlist/${userId}/${cleanProductId}`,
            {
              method: "DELETE",
              credentials: "include"
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
              "Wishlist remove failed"
          );
        }

        setWishlist((prev) =>
          prev.filter(
            (item) =>
              Number(item.id) !==
              cleanProductId
          )
        );
      } catch (error) {
        console.error(
          "Remove wishlist error:",
          error
        );

        showAlert(
          "Wishlist Error",
          error.message ||
            "Unable to remove product."
        );
      } finally {
        setWishlistLoading(false);
      }
    };

  /* =====================================================
     ADD TO CART - DATABASE
  ===================================================== */

  const addToCart = async (product) => {
    try {
      
const userId = Number(user?.id);

if (!userId) {
  showAlert(
    "Please login",
    "Please login to add products to cart."
  );
  return;
}


      const productId =
        Number(product?.id);

      if (!userId) {
        showAlert(
          "Cart Error",
          "User ID not found. Please login again."
        );

        return;
      }

      if (!productId) {
        showAlert(
          "Cart Error",
          "Product ID not found."
        );

        return;
      }

      if (
        Number(product?.stock || 0) <= 0
      ) {
        showAlert(
          "Out of Stock",
          "Product is currently out of stock."
        );

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/cart`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",

body: JSON.stringify({
  userId,
  productId,
  quantity: 1,
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
            "Unable to add product to cart."
        );
      }

      showAlert(
        "Added to Cart 🛒",
        "Product has been added to your cart."
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );
    } catch (error) {
      console.error(
        "Cart error:",
        error
      );

      showAlert(
        "Cart Error",
        error.message ||
          "Unable to add product to cart."
      );
    }
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const buyNow = (product) => {
  if (Number(product?.stock || 0) <= 0) {
    showAlert("Product is out of stock!");
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    showAlert("Product ID not found.");
    return;
  }

  if (authLoading) return;

  if (!user?.id) {
    navigate("/login");
    return;
  }

  navigate(`/checkout?buyNow=${productId}`);
};

  /* =====================================================
     CATEGORIES FROM DATABASE
  ===================================================== */

  const categories = useMemo(() => {
    const values =
      allProducts
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean);

    return [
      ...new Set(values),
    ];
  }, [allProducts]);

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filteredProducts =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      let result =
        allProducts.filter(
          (product) => {
            const name =
              String(
                product.name || ""
              ).toLowerCase();

            const category =
              String(
                product.category || ""
              ).toLowerCase();

            const description =
              String(
                product.description || ""
              ).toLowerCase();

            const matchesSearch =
              !query ||
              name.includes(query) ||
              category.includes(query) ||
              description.includes(query);

            const matchesCategory =
              selectedCategory ===
                "all" ||
              category ===
                selectedCategory.toLowerCase();

            const price =
              Number(
                product.price || 0
              );

            let matchesPrice = true;

            if (
              priceRange ===
              "under500"
            ) {
              matchesPrice =
                price < 500;
            }

            if (
              priceRange ===
              "500to1000"
            ) {
              matchesPrice =
                price >= 500 &&
                price <= 1000;
            }

            if (
              priceRange ===
              "1000to2000"
            ) {
              matchesPrice =
                price > 1000 &&
                price <= 2000;
            }

            if (
              priceRange ===
              "above2000"
            ) {
              matchesPrice =
                price > 2000;
            }

            return (
              matchesSearch &&
              matchesCategory &&
              matchesPrice
            );
          }
        );

      /* SORT */

      if (
        sortBy ===
        "priceLow"
      ) {
        result.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );
      }

      if (
        sortBy ===
        "priceHigh"
      ) {
        result.sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );
      }

      if (
        sortBy ===
        "name"
      ) {
        result.sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              )
            )
        );
      }

      return result;
    }, [
      allProducts,
      searchQuery,
      selectedCategory,
      priceRange,
      sortBy,
    ]);

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("relevance");
  };

  

  /* =====================================================
     CLOSE MOBILE FILTER
  ===================================================== */

  const closeMobileFilter = () => {
    setMobileFilterOpen(false);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="search-results-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="search-results-header">

        <div className="search-heading">

          <div className="search-eyebrow">
            DISCOVER SOMETHING BEAUTIFUL
          </div>

          <h1>
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "All Products"}
          </h1>

          <p>
            {loading
              ? "Finding products..."
              : `${filteredProducts.length} products found`}
          </p>

        </div>

      </header>


      {/* =================================================
          MOBILE FILTER BUTTON
      ================================================= */}

      <button
        type="button"
        className="mobile-filter-button"
        onClick={() =>
          setMobileFilterOpen(true)
        }
      >
        <span className="filter-button-icon">
          ☰
        </span>

        <span>
          Filters
        </span>

        {(selectedCategory !== "all" ||
          priceRange !== "all") && (
          <span className="filter-count">
            {(selectedCategory !== "all" ? 1 : 0) +
              (priceRange !== "all" ? 1 : 0)}
          </span>
        )}
      </button>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileFilterOpen && (
        <div
          className="filter-overlay"
          onClick={closeMobileFilter}
        ></div>
      )}


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="search-results-layout">

        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <aside
  className={`search-filter-sidebar ${
    mobileFilterOpen ? "mobile-open" : ""
  }`}
>
  {/* FILTER HEADER */}
  <div className="filter-mobile-header">
    <div className="filter-header-content">
      <div className="filter-label">
        COLLECTION
      </div>

      <h2>Filters</h2>

      <span>
        Refine your selection
      </span>
    </div>

    <button
      type="button"
      className="filter-close-btn"
      onClick={closeMobileFilter}
      aria-label="Close filters"
    >
      ×
    </button>
  </div>

  {/* SCROLLABLE FILTER CONTENT */}
  <div className="filter-scroll-content">

    {/* CATEGORY */}
    <div className="filter-section">

      <div className="filter-section-title">
        <h3>Category</h3>

        <span>
          {categories.length}
        </span>
      </div>

      <label
        className={`filter-option ${
          selectedCategory === "all"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="category"
          checked={selectedCategory === "all"}
          onChange={() =>
            setSelectedCategory("all")
          }
        />

        <span>All Categories</span>
      </label>

      {categories.map((category) => (
        <label
          className={`filter-option ${
            selectedCategory === category
              ? "selected"
              : ""
          }`}
          key={category}
        >
          <input
            type="radio"
            name="category"
            checked={
              selectedCategory === category
            }
            onChange={() =>
              setSelectedCategory(category)
            }
          />

          <span>{category}</span>
        </label>
      ))}
    </div>

    {/* PRICE */}
    <div className="filter-section">

      <div className="filter-section-title">
        <h3>Price Range</h3>
      </div>

      <label
        className={`filter-option ${
          priceRange === "all"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="price"
          checked={priceRange === "all"}
          onChange={() =>
            setPriceRange("all")
          }
        />

        <span>All Prices</span>
      </label>

      <label
        className={`filter-option ${
          priceRange === "under500"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="price"
          checked={priceRange === "under500"}
          onChange={() =>
            setPriceRange("under500")
          }
        />

        <span>Under ₹500</span>
      </label>

      <label
        className={`filter-option ${
          priceRange === "500to1000"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="price"
          checked={
            priceRange === "500to1000"
          }
          onChange={() =>
            setPriceRange("500to1000")
          }
        />

        <span>₹500 - ₹1000</span>
      </label>

      <label
        className={`filter-option ${
          priceRange === "1000to2000"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="price"
          checked={
            priceRange === "1000to2000"
          }
          onChange={() =>
            setPriceRange("1000to2000")
          }
        />

        <span>₹1000 - ₹2000</span>
      </label>

      <label
        className={`filter-option ${
          priceRange === "above2000"
            ? "selected"
            : ""
        }`}
      >
        <input
          type="radio"
          name="price"
          checked={
            priceRange === "above2000"
          }
          onChange={() =>
            setPriceRange("above2000")
          }
        />

        <span>Above ₹2000</span>
      </label>
    </div>

  </div>

  {/* BOTTOM ACTIONS */}
  <div className="filter-actions">

    <button
      type="button"
      className="clear-filter-btn"
      onClick={clearFilters}
    >
      Clear All
    </button>

    

    <button
      type="button"
      className="apply-filter-btn"
      onClick={closeMobileFilter}
    >
      Apply Filters
    </button>

  </div>
</aside>


        {/* =================================================
            PRODUCTS AREA
        ================================================= */}

        <main className="search-products-area">

          {/* TOP BAR */}

          <div className="search-sort-bar">

            <div className="sort-left">

              <span>
                Showing
              </span>

              <strong>
                {loading
                  ? "—"
                  : filteredProducts.length}
              </strong>

              <span>
                products
              </span>

            </div>


            <div className="sort-right">

              <span>
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >

                <option value="relevance">
                  Relevance
                </option>

                <option value="priceLow">
                  Price: Low to High
                </option>

                <option value="priceHigh">
                  Price: High to Low
                </option>

                <option value="name">
                  Name
                </option>

              </select>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="search-loading">

              <div className="search-spinner"></div>

              <h3>
                Finding your favourites
              </h3>

              <p>
                Please wait while we load the collection...
              </p>

            </div>

          ) : filteredProducts.length > 0 ? (

            <div className="search-products-grid">

              {filteredProducts.map(
                (product) => (

                  <ProductCard
                    key={product.id}
                    product={product}

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

            <div className="search-no-results">

              <div className="no-result-icon">
                🔍
              </div>

              <div className="no-results-eyebrow">
                NOTHING FOUND
              </div>

              <h2>
                No products found
              </h2>

              <p>
                We couldn't find any products
                matching
                {searchQuery
                  ? ` "${searchQuery}".`
                  : " your selected filters."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/products"
                  )
                }
              >
                View All Products
              </button>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default SearchResults;
