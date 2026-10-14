import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import "../css/global.css";
import "../css/header.css";
import "../css/navbar.css";
import "../css/home.css";
import "../css/products.css";
import "../css/reviews.css";

import ProductCard from "../components/ProductCard";

const API_URL = "http://localhost:5000";

const showAlert = (title, message = "") =>
  alert(message ? `${title}\n${message}` : title);


/* =====================================================
   DEFAULT BANNERS
===================================================== */

const defaultBanners = [
  {
    id: 1,
    small: "HANDMADE WITH LOVE",
    title: "Make Every Moment\nSpecial",
    text: "Beautiful handmade & personalized gifts for every special occasion.",
    button: "SHOP NOW",
    link: "/products",
    image: "/banner1.png",
  },
  {
    id: 2,
    small: "SPECIAL GIFTS",
    title: "Gifts Made\nWith Love",
    text: "Discover beautiful gifts for birthdays, anniversaries and every special moment.",
    button: "SHOP NOW",
    link: "/products",
    image: "/banner2.png",
  },
  {
    id: 3,
    small: "PERSONALIZED FOR YOU",
    title: "Create Something\nSpecial",
    text: "Make your memories unforgettable with our personalized gifts.",
    button: "EXPLORE NOW",
    link: "/products",
    image: "/banner3.png",
  },
];


function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();


  /* =====================================================
     CART
  ===================================================== */

  const [cartCount, setCartCount] = useState(0);


  /* =====================================================
     PRODUCTS
  ===================================================== */

  const [adminProducts, setAdminProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [showSuggestions, setShowSuggestions] =
    useState(false);


  /* =====================================================
     WISHLIST
  ===================================================== */

const [wishlist, setWishlist] = useState([]);


  /* =====================================================
     BANNERS
  ===================================================== */

  const [banners, setBanners] =
    useState(defaultBanners);

  const [currentSlide, setCurrentSlide] =
    useState(0);

  const [slideDirection, setSlideDirection] =
    useState("next");


  /* =====================================================
     LOAD BANNERS
  ===================================================== */

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/banners`
        );

        const data = await response.json();

        if (
          response.ok &&
          data.success &&
          Array.isArray(data.banners) &&
          data.banners.length > 0
        ) {
          setBanners(data.banners);
        } else {
          setBanners(defaultBanners);
        }
      } catch (error) {
        console.error(
          "Banner fetch error:",
          error
        );

        setBanners(defaultBanners);
      }
    };

    loadBanners();
  }, []);


  /* =====================================================
     PROTECT SLIDE INDEX
  ===================================================== */

  useEffect(() => {
    if (
      banners.length > 0 &&
      currentSlide >= banners.length
    ) {
      setCurrentSlide(0);
    }
  }, [banners.length, currentSlide]);


  /* =====================================================
     AUTO SLIDER
  ===================================================== */

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setSlideDirection("next");

      setCurrentSlide((prev) =>
        prev === banners.length - 1
          ? 0
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);


  /* =====================================================
     LOAD PRODUCTS
     
     IMPORTANT:
     Backend now returns:
     
     pages: ["home", "new-arrivals", "shop"]
     
     Therefore we check product.pages,
     NOT product.page.
  ===================================================== */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/products`
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
            "Products fetch failed"
          );
        }

        const products =
          Array.isArray(data.products)
            ? data.products
            : [];



            // Load Best Seller products
const markedProducts = products.filter(
  (product) =>
    String(product.badge || "").toUpperCase() ===
    "BEST SELLER"
);

setBestSellerProducts(
  markedProducts.length > 0
    ? markedProducts
    : products
);
        /* =============================================
           ONLY PRODUCTS SELECTED FOR HOME
        ============================================= */

        const homeProducts =
          products.filter((product) => {

            let pages = product.pages;


            /* Safety for old data */

            if (
              typeof pages === "string"
            ) {
              try {
                pages = JSON.parse(pages);
              } catch {
                pages = [pages];
              }
            }


            if (!Array.isArray(pages)) {
              pages = [];
            }


            return pages.includes("home");
          });


        setAdminProducts(homeProducts);


      } catch (error) {
        console.error(
          "Products fetch error:",
          error
        );

        setAdminProducts([]);
      }
    };


    loadProducts();

}, []);
    
  /* =====================================================
     CART
  ===================================================== */

useEffect(() => {
  if (authLoading) return;

  let cancelled = false;

  const loadCartCount = async () => {
    if (!user?.id) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/${user.id}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Cart load failed");
      }

      if (!cancelled) {
        const items = Array.isArray(data.cart) ? data.cart : [];

        setCartCount(
          items.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          )
        );
      }
    } catch (error) {
      console.error("Load Cart Error:", error);
      if (!cancelled) setCartCount(0);
    }
  };

  const handleCartUpdate = () => {
    loadCartCount();
  };

  loadCartCount();
  window.addEventListener("cartUpdated", handleCartUpdate);

  return () => {
    cancelled = true;
    window.removeEventListener("cartUpdated", handleCartUpdate);
  };
}, [user?.id, authLoading]);



  /* =====================================================
   LOAD LOGGED-IN USER'S WISHLIST
===================================================== */


useEffect(() => {
  if (authLoading) return;

  let cancelled = false;

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

      if (!cancelled) {
        setWishlist(data.products || data.wishlist || []);
      }
    } catch (error) {
      console.error("Load Wishlist Error:", error);
      if (!cancelled) setWishlist([]);
    }
  };

  loadWishlist();

  return () => {
    cancelled = true;
  };
}, [user?.id, authLoading]);



/* =====================================================
   WISHLIST - ADD
===================================================== */

const addToWishlist = async (product) => {
  try {
    if (authLoading) return;

if (!user?.id) {
  showAlert("Please login", "Please login to continue.");
  navigate("/login");
  return;
}

const userId = Number(user.id);

    const productId = Number(product?.id);

    if (!userId) {
      showAlert(
        "Login Error",
        "User ID not found. Please login again."
      );
      return;
    }

    if (!productId) {
      showAlert(
        "Product Error",
        "Product ID not found."
      );
      return;
    }

    const response = await fetch(
      `${API_URL}/api/wishlist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          productId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Wishlist add failed"
      );
    }

    // Reload this user's wishlist from MySQL.
    const wishlistResponse = await fetch(
  `${API_URL}/api/wishlist/${userId}`,
  { credentials: "include" }
);

    const wishlistData = await wishlistResponse.json();

    if (
      !wishlistResponse.ok ||
      !wishlistData.success
    ) {
      throw new Error("Could not refresh wishlist");
    }

    setWishlist(
      wishlistData.products ||
      wishlistData.wishlist ||
      []
    );

    // Do not save a shared wishlist in localStorage.

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  } catch (error) {
    console.error("Add Wishlist Error:", error);

    showAlert(
      "Wishlist Error",
      error.message ||
        "Unable to add product to wishlist."
    );
  }
};


 /* =====================================================
   WISHLIST - REMOVE
===================================================== */

const removeFromWishlist = async (productId) => {
  try {
    if (authLoading) return;

if (!user?.id) {
  showAlert("Please login", "Please login to continue.");
  navigate("/login");
  return;
}

const userId = Number(user.id);

    const cleanProductId = Number(productId);

    if (!userId) {
      showAlert(
        "Login Error",
        "User ID not found. Please login again."
      );
      return;
    }

    if (!cleanProductId) {
      showAlert(
        "Product Error",
        "Product ID not found."
      );
      return;
    }

    const response = await fetch(
      `${API_URL}/api/wishlist/${userId}/${cleanProductId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok && response.status !== 404) {
      throw new Error(
        data.message || "Wishlist remove failed"
      );
    }

    setWishlist((previous) =>
      previous.filter(
        (item) =>
          Number(item.id) !== cleanProductId
      )
    );

    // Do not save a shared wishlist in localStorage.

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  } catch (error) {
    console.error("Remove Wishlist Error:", error);

    showAlert(
      "Wishlist Error",
      error.message ||
        "Unable to remove product from wishlist."
    );
  }
};


  /* =====================================================
     ADD TO CART
  ===================================================== */

  
const addToCart = async (product) => {
  if (authLoading) return;

  if (!user?.id) {
    showAlert("Please login", "Please login to add items to your cart.");
    navigate("/login");
    return;
  }

  const productId = Number(product?.id);

  if (!productId) {
    showAlert("Cart Error", "Product ID not found.");
    return;
  }

  if (Number(product.stock) <= 0) {
    showAlert("Product is out of stock!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId: Number(user.id),
        productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add product to cart.");
    }

    window.dispatchEvent(new Event("cartUpdated"));

    showAlert("Added to Cart 🛒", "Product has been added to your cart.");
  } catch (error) {
    console.error("Add Cart Error:", error);
    showAlert("Cart Error", error.message || "Unable to add product.");
  }
};



  /* =====================================================
     BUY NOW
  ===================================================== */

  
const buyNow = (product) => {
  if (Number(product?.stock) <= 0) {
    showAlert("Product is out of stock!");
    return;
  }

  if (authLoading) return;

  if (!user?.id) {
    showAlert("Please login", "Please login to continue.");
    navigate("/login");
    return;
  }

  navigate(`/checkout?buyNow=${product.id}`);
};



  /* =====================================================
     SEARCH SUGGESTIONS
  ===================================================== */

  const searchSuggestions =
    adminProducts
      .filter((product) => {

        const name =
          String(
            product.name || ""
          ).toLowerCase();


        return (
          searchText.trim() &&
          name.includes(
            searchText
              .toLowerCase()
              .trim()
          )
        );
      })
      .slice(0, 6);


  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchText(value);

    setShowSuggestions(
      value.trim().length > 0
    );
  };


  const handleSuggestionClick =
    (product) => {

      setSearchText("");

      setShowSuggestions(false);

      navigate(
        `/product/${product.id}`
      );
    };


  /* =====================================================
     SLIDER - NEXT
  ===================================================== */

  const goToNextSlide = () => {

    if (banners.length <= 1) {
      return;
    }


    setSlideDirection("next");


    setCurrentSlide((prev) =>
      prev === banners.length - 1
        ? 0
        : prev + 1
    );
  };


  /* =====================================================
     SLIDER - PREVIOUS
  ===================================================== */

  const goToPreviousSlide = () => {

    if (banners.length <= 1) {
      return;
    }


    setSlideDirection("prev");


    setCurrentSlide((prev) =>
      prev === 0
        ? banners.length - 1
        : prev - 1
    );
  };


  /* =====================================================
     SLIDER - DOT
  ===================================================== */

  const goToSlide = (index) => {

    if (index === currentSlide) {
      return;
    }


    setSlideDirection(
      index > currentSlide
        ? "next"
        : "prev"
    );


    setCurrentSlide(index);
  };


  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <>
      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero-slider">

        {banners.map(
          (banner, index) => {

            let slideClass = "";


            /* ===========================================
               ACTIVE
            =========================================== */

            if (
              index === currentSlide
            ) {
              slideClass = "active";
            }


            /* ===========================================
               NEXT DIRECTION
            =========================================== */

            else if (
              slideDirection === "next"
            ) {

              const previousSlide =
                (
                  currentSlide -
                  1 +
                  banners.length
                ) %
                banners.length;


              if (
                index === previousSlide
              ) {
                slideClass = "prev";
              } else {
                slideClass = "next";
              }
            }


            /* ===========================================
               PREVIOUS DIRECTION
            =========================================== */

            else {

              const nextSlide =
                (
                  currentSlide +
                  1
                ) %
                banners.length;


              if (
                index === nextSlide
              ) {
                slideClass = "next";
              } else {
                slideClass = "prev";
              }
            }


            const title =
              String(
                banner.title || ""
              );


            return (
              <div
                key={
                  banner.id ||
                  index
                }
                className={`hero-slide ${slideClass}`}
              >

                <img
                  src={
                    banner.image
                  }
                  alt={title.replace(
                    /\n/g,
                    " "
                  )}
                  className="hero-banner-image"
                />


                <div className="hero-overlay"></div>


                <div className="hero-slide-content">

                  <p className="hero-small">
                    {banner.small}
                  </p>


                  <h2>

                    {title
                      .split("\n")
                      .map(
                        (
                          line,
                          i
                        ) => (
                          <span
                            key={i}
                          >
                            {line}

                            {i <
                              title.split(
                                "\n"
                              ).length -
                                1 && (
                              <br />
                            )}
                          </span>
                        )
                      )}

                  </h2>


                  <p className="hero-text">
                    {banner.text}
                  </p>


                  <button
                    className="hero-btn"
                    onClick={() =>
                      navigate(
                        banner.link ||
                          "/products"
                      )
                    }
                  >
                    {banner.button ||
                      "SHOP NOW"}
                  </button>

                </div>

              </div>
            );
          }
        )}


        {/* =============================================
            PREVIOUS
        ============================================= */}

        {banners.length > 1 && (
          <button
            className="hero-arrow hero-prev"
            onClick={
              goToPreviousSlide
            }
            aria-label="Previous slide"
          >
            ‹
          </button>
        )}


        {/* =============================================
            NEXT
        ============================================= */}

        {banners.length > 1 && (
          <button
            className="hero-arrow hero-next"
            onClick={
              goToNextSlide
            }
            aria-label="Next slide"
          >
            ›
          </button>
        )}


        {/* =============================================
            DOTS
        ============================================= */}

        {banners.length > 1 && (
          <div className="hero-dots">

            {banners.map(
              (_, index) => (
                <button
                  key={index}
                  className={`hero-dot ${
                    currentSlide ===
                    index
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    goToSlide(index)
                  }
                  aria-label={`Go to slide ${
                    index + 1
                  }`}
                />
              )
            )}

          </div>
        )}

      </section>


      {/* =================================================
          CATEGORY
      ================================================= */}

      <section className="category-section">

        <div className="section-heading">

          <h2>
            Shop By Category
          </h2>

          <p>
            Find the perfect gift for
            every occasion
          </p>

        </div>


        <div className="category-grid">

          {[
            [
              "🎁",
              "Personalized Gifts",
            ],
            [
              "🖼️",
              "Photo Frames",
            ],
            [
              "💝",
              "Gift Hampers",
            ],
            [
              "🧸",
              "Birthday Gifts",
            ],
            [
              "🌹",
              "Anniversary Gifts",
            ],
            [
              "💑",
              "Couple Gifts",
            ],
          ].map(
            ([icon, name]) => (
              <div
                className="category-card"
                key={name}
              >

                <div className="category-image">
                  {icon}
                </div>

                <h3>
                  {name}
                </h3>

              </div>
            )
          )}

        </div>

      </section>


      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section className="products-section">

        <div className="product-heading">

          <div>

            <h2>
              Amazing Gifts
            </h2>

            <p>
              Choose something special
              for your loved ones
            </p>

          </div>


          <button
            className="view-all-products"
            onClick={() =>
              navigate("/products")
            }
          >
            View All
          </button>

        </div>


        <div className="products-grid">

          {adminProducts.length > 0 ? (

            adminProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  buyNow={buyNow}
                  wishlist={wishlist}
                  addToWishlist={
                    addToWishlist
                  }
                  removeFromWishlist={
                    removeFromWishlist
                  }
                />
              )
            )

          ) : (

            <p>
              No products available.
            </p>

          )}

        </div>

      </section>



    {/* =================================================
    BEST SELLER PRODUCTS
================================================= */}

<section className="products-section home-best-sellers">

  <div className="product-heading">
    <div>
      <h2>Best Sellers</h2>
      <p>Our customers' favourite gifts</p>
    </div>
  </div>

  <div className="products-grid">
    {bestSellerProducts.length > 0 ? (
      bestSellerProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
          buyNow={buyNow}
          wishlist={wishlist}
          addToWishlist={addToWishlist}
          removeFromWishlist={removeFromWishlist}
        />
      ))
    ) : (
      <p>No best seller products available.</p>
    )}
  </div>

</section>


      {/* =================================================
          REVIEWS
      ================================================= */}

      <section className="reviews-section">

        <div className="section-heading">

          <h2>
            Loved by Our Customers
          </h2>

          <p>
            Beautiful gifts, happy
            customers ❤️
          </p>

        </div>


        <div className="reviews-grid">

          {[
            [
              "P",
              "Priya Sharma",
              `"The gift was absolutely beautiful! The quality was amazing and the packaging was also very cute. My sister loved it."`,
            ],

            [
              "R",
              "Rahul Verma",
              `"I ordered a personalized photo frame for my anniversary. It came out really beautiful. Highly recommended!"`,
            ],

            [
              "A",
              "Anjali Patel",
              `"Very nice product and fast delivery. The personalized gift looked exactly like I wanted. Thank you Divya Creation!"`,
            ],

            [
              "S",
              "Sneha Gupta",
              `"Beautifully made and packed with so much care. It was the perfect birthday gift!"`,
            ],
          ].map(
            ([
              avatar,
              name,
              review,
            ]) => (

              <div
                className="review-card"
                key={name}
              >

                <div className="review-stars">
                  ★★★★★
                </div>


                <p className="review-text">
                  {review}
                </p>


                <div className="review-user">

                  <div className="user-avatar">
                    {avatar}
                  </div>


                  <div>

                    <h4>
                      {name}
                    </h4>

                    <span>
                      Verified Customer
                    </span>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </section>
    </>
  );
}


export default Home;
