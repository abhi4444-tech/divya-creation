import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Truck,
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  Menu,
  Home,
  Grid2X2,
  ArrowLeft,
} from "lucide-react";

import "../css/header.css";
import "../css/navbar.css";
const API_URL = import.meta.env.VITE_API_URL;

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isHomePage = location.pathname === "/";

  const [cartCount, setCartCount] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  
const [isScrolled, setIsScrolled] = useState(false);
const [headerHeight, setHeaderHeight] = useState(0);
const showScrollBack =
  isScrolled && location.pathname !== "/";
const headerRef = useRef(null);

useEffect(() => {
  const measureHeader = () => {
    if (headerRef.current && !isScrolled) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  };

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100);
  };

  measureHeader();
  handleScroll();

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", measureHeader);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", measureHeader);
  };
}, [isScrolled]);



  
  // ================= LOAD HEADER DATA =================

  const loadHeaderData = async () => {
    if (!user?.id) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/${user.id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Cart load failed");
      }

      const cart = Array.isArray(data.cart) ? data.cart : [];

      const count = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch (error) {
      console.error("Header cart error:", error);
      setCartCount(0);
    }
  };


// ================= LOAD CATEGORIES FROM DATABASE =================

useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Categories load nahi hui"
        );
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (error) {
      console.error("Navbar categories error:", error);
    }
  };

  loadCategories();
}, []);

//=======================
//search handle karta hai ye 
//===========================

const handleSearch = (e) => {
  e.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    return;
  }

  setShowSuggestions(false);

  navigate(
    `/search?query=${encodeURIComponent(query)}`
  );
};



// ================= PRODUCT SEARCH SUGGESTIONS =================

useEffect(() => {
  const loadSearchSuggestions = async () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products`
      );

      const data = await response.json();

      console.log("SEARCH QUERY:", query);
      console.log("PRODUCTS:", data.products);

      if (!response.ok || !data.success) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const products = Array.isArray(data.products)
        ? data.products
        : [];

      const matchedProducts = products.filter(
        (product) =>
          String(product.name || "")
            .toLowerCase()
            .includes(query)
      );

      console.log(
        "MATCHED PRODUCTS:",
        matchedProducts
      );

      setSearchSuggestions(matchedProducts);
      setShowSuggestions(true);

    } catch (error) {
      console.error(
        "Search suggestions error:",
        error
      );

      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  loadSearchSuggestions();
}, [searchQuery]);




// ================= SUGGESTION CLICK =================

const handleSuggestionClick = (product) => {
  setSearchQuery("");
  setSearchSuggestions([]);
  setShowSuggestions(false);

  navigate(`/product/${product.id}`);
};




  useEffect(() => {
  loadHeaderData();

  window.addEventListener("cartUpdated", loadHeaderData);

  return () => {
    window.removeEventListener("cartUpdated", loadHeaderData);
  };
}, [location, user?.id]);

  // ================= ACTIVE NAV =================

  const isHome =
    location.pathname === "/";

  const isBestSeller =
    location.pathname === "/best-sellers";

  return (
    
<div
  ref={headerRef}
  className={`site-header ${isScrolled ? "is-scrolled" : ""} ${
    location.pathname === "/" ? "home-page-header" : ""
  }`}
  style={
    isScrolled && headerHeight > 0
      ? { height: `${headerHeight}px` }
      : undefined
  }
>


  {showScrollBack && (
  <button
    type="button"
    className="mobile-scroll-back"
    onClick={() => navigate(-1)}
    aria-label="Go back"
  >
    <ArrowLeft />
  </button>
)}

      {/* ================= TOP BAR ================= */}

      <div className="top-bar">

        <div className="container">

          <div className="left">

            <Truck size={18} />

            Free Delivery on orders above ₹999

          </div>

          <div className="right">

            <a href="#">
              Track Order
            </a>

            <span>|</span>

            <a href="#">
              Help &amp; Support
            </a>

            <i className="fa-brands fa-instagram"></i>

            <i className="fa-brands fa-youtube"></i>

            <i className="fa-brands fa-facebook-f"></i>

          </div>

        </div>

      </div>


      {/* ================= MAIN HEADER ================= */}

      <header>

        <div className="container header">

          {/* LOGO */}

          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >

            <h1>
              Divya
            </h1>

            <span>
              CREATION
            </span>

          </div>


{/* ================= SEARCH ================= */}

<form
  className="search"
  onSubmit={handleSearch}
>


  <Search
    className="search-icon"
    size={18}
    strokeWidth={1.7}
  />

 <input
  type="text"
  placeholder="Search for handmade gifts..."
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  }}
  onFocus={() => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }}
/>


  <button
    type="submit"
    aria-label="Search"
  >
    <Search size={18} />
    Search
  </button>

  {/* ================= SUGGESTIONS ================= */}

  {showSuggestions &&
    searchQuery.trim() && (

      <div className="search-suggestions">

        {searchSuggestions.length > 0 ? (

          searchSuggestions.map((product) => (

            <button
              type="button"
              className="search-suggestion-item"
              key={product.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(product);
              }}
            >

              <div className="search-suggestion-image">

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <span>🎁</span>
                )}

              </div>

              <div className="search-suggestion-info">

                <strong>
                  {product.name}
                </strong>

                <span>
                  ₹
                  {Number(
                    product.price || 0
                  ).toLocaleString("en-IN")}
                </span>

              </div>

            </button>

          ))

        ) : (

          <div className="search-no-results">
            No products found
          </div>

        )}

      </div>

    )}

</form>




          {/* ICONS */}

          <div className="icons">

            {/* LOGIN / PROFILE */}

            <div
              className="icon"
              onClick={() => {

if (user) {
  navigate("/profile");
} else {
  navigate("/login");
}
            

              }}
              style={{ cursor: "pointer" }}
            >

              <UserRound size={24} />

              <p>

                {user
  ? `Hello, ${user.name}`
  : "Login / Signup"}

              </p>

            </div>


{/* WISHLIST */}

<div
  className="icon"
  onClick={() => navigate("/wishlist")}
  style={{ cursor: "pointer" }}
>
  <Heart
    size={24}
    className="heartClg"
  />

  <p>
    Wishlist
  </p>
</div>



            {/* CART */}

            <Link
              to="/cart"
              className="icon cart"
            >

              <ShoppingCart size={24} />

              <p>
                Cart
              </p>

              <span>
                {cartCount}
              </span>

            </Link>

          </div>

        </div>

      </header>


      {/* ================= NAVBAR ================= */}

      <nav>

        <div className="container nav">

          {/* ALL CATEGORIES */}

          <div className="category-wrapper">

<button
  type="button"
  className="category"
  onClick={() => setCategoryOpen((prev) => !prev)}
>
  <Menu size={22} />

  <span>All Categories</span>
</button>



            {/* CATEGORY DROPDOWN */}

            {categoryOpen && (

              <div className="category-dropdown">

               {categories.map((category) => (
  <Link
    key={category.id}
    to={`/products?category=${encodeURIComponent(category.name)}`}
    onClick={() => setCategoryOpen(false)}
  >
    {category.name}
  </Link>
))}

              </div>

            )}

          </div>


          {/* NAV LINKS */}

          <ul>

            <li>

              <Link
                to="/"
                className={
                  isHome ? "active" : ""
                }
              >
                Home
              </Link>

            </li>


            <li>

<Link
  to="/shop"
  className={location.pathname === "/shop" ? "active" : ""}
>
Shop
</Link>

            </li>


            <li>

              <Link
                to="/best-sellers"
                className={
                  isBestSeller ? "active" : ""
                }
              >
                Best Sellers
              </Link>

            </li>


<li>
  <Link
    to="/new-arrivals"
    className={
      location.pathname === "/new-arrivals" ? "active" : ""
    }
  >
    New Arrivals
  </Link>
</li>



            <li>

              <Link
                to="/contact"
                className={
                  location.pathname === "/contact"
                    ? "active"
                    : ""
                }
              >
                Contact Us
              </Link>

            </li>

          </ul>

        </div>

      </nav>

      {/* ================= MOBILE CATEGORY MENU ================= */}

{categoryOpen && (
  <div className="mobile-category-dropdown">
    <div className="mobile-category-header">
      <strong>All Categories</strong>

      <button
        type="button"
        onClick={() => setCategoryOpen(false)}
      >
        ×
      </button>
    </div>

    <div className="mobile-category-list">
     {categories.map((category) => (
  <Link
    key={category.id}
    to={`/products?category=${encodeURIComponent(category.name)}`}
    onClick={() => setCategoryOpen(false)}
  >
    {category.name}
  </Link>
))}
    </div>
  </div>
)}


      {/* ================= MOBILE BOTTOM NAV ================= */}
    {isHomePage && (
      <div className="mobile-bottom-nav">

        <button
          onClick={() => navigate("/")}
          className={
            isHome
              ? "mobile-nav-item active"
              : "mobile-nav-item"
          }
        >
          <Home size={21} />

          <span>
            Home
          </span>
        </button>


<Link
  to="/categories"
  className="mobile-nav-item"
>
  <Grid2X2 size={21} />

  <span>
    Categories
  </span>
</Link>




        <button
          onClick={() =>
            navigate("/best-sellers")
          }
          className={
            isBestSeller
              ? "mobile-nav-item active"
              : "mobile-nav-item"
          }
        >
          <span className="mobile-sale-icon">
            %
          </span>

          <span>
            Best Sellers
          </span>
        </button>


        <button
          onClick={() =>
            navigate("/profile")
          }
          className="mobile-nav-item"
        >
          <UserRound size={21} />

          <span>
            Profile
          </span>
        </button>


        <button
          onClick={() =>
            navigate("/cart")
          }
          className="mobile-nav-item mobile-cart-nav"
        >
          <ShoppingCart size={21} />

          {cartCount > 0 && (
            <b>
              {cartCount}
            </b>
          )}

          <span>
            Cart
          </span>
        </button>

      </div>
)}

      {/* ================= WHATSAPP ================= */}

<a
  href="https://wa.me/"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-fixed"
  aria-label="WhatsApp"
>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.371.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371.075-.57.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.89-9.884 2.64 0 5.122 1.03 6.986 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.893a11.86 11.86 0 001.594 5.943L.057 24l6.304-1.654a11.86 11.86 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.479-8.413"
    />
  </svg>
</a>


    </div>
  );
}

export default Header;
