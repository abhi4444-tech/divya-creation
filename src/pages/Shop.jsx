import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";

import { useSearchParams } from "react-router-dom";

import "../css/Shop.css";
import ProductCard from "../components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;


/* =====================================================
   CATEGORIES
===================================================== */

const categories = [
  "All",
  "Nath",
  "Mangalsutra",
  "Necklace",
  "Rani Haar",
  "Mundavlya",
  "Ear Needle",
  "Hairpin",
  "Pearl Mala",
];


/* =====================================================
   SHOP
===================================================== */

function Shop() {

  const { user, loading: authLoading } = useAuth();

  /*
   * URL:
   * /shop?search=nath
   */

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


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
     SEARCH PARAMS
  ===================================================== */

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const search =
    searchParams.get("search") || "";


  /* =====================================================
     STATES
  ===================================================== */

  const [category, setCategory] =
    useState("All");


  const [sort, setSort] =
    useState("default");


  const [wishlist, setWishlist] = useState([]);


  
  /* =====================================================
     WISHLIST — DATABASE
  ===================================================== */

  const userId = user?.id ?? user?.userId;

  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      if (!userId) {
        setWishlist([]);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/wishlist/${userId}`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Wishlist load failed");
        }

        if (!cancelled) {
          setWishlist(data.products || []);
        }
      } catch (error) {
        console.error("Wishlist load error:", error);
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addToWishlist = async (product) => {
    if (!userId) {
      alert("Please log in to use your wishlist.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Wishlist update failed");
      }

      setWishlist((prev) =>
        prev.some((item) => String(item.id) === String(product.id))
          ? prev
          : [...prev, product]
      );
    } catch (error) {
      console.error("Add wishlist error:", error);
      alert(error.message || "Wishlist mein add nahi hua.");
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/${userId}/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Wishlist remove failed");
      }

      setWishlist((prev) =>
        prev.filter((item) => String(item.id) !== String(productId))
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);
      alert(error.message || "Wishlist se remove nahi hua.");
    }
  };

  /* =====================================================
     ADD TO CART — DATABASE
  ===================================================== */

  const addToCart = async (product) => {
    if (!userId) {
      alert("Please log in to add products to your cart.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Add to cart failed");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      alert("Product added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.message || "Product cart mein add nahi hua.");
    }
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const buyNow = (product) => {
    if (!userId) {
      alert("Please log in before checkout.");
      return;
    }

    if (Number(product.stock) <= 0) {
      alert("Product is out of stock!");
      return;
    }

    window.location.href =
      `/checkout?buyNow=${encodeURIComponent(product.id)}`;
  };



  /* =====================================================
     SHOP SEARCH
===================================================== */

  const handleShopSearch = (e) => {

    const value =
      e.target.value;


    if (value.trim()) {

      setSearchParams({
        search: value,
      });

    } else {

      setSearchParams({});

    }

  };


  /* =====================================================
     CLEAR SEARCH
===================================================== */

  const clearSearch = () => {

    setSearchParams({});

  };


  /* =====================================================
     FILTER PRODUCTS
===================================================== */

  const filteredProducts =
    useMemo(() => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      let result =
        products.filter(
          (product) => {

            const productName =
              String(
                product.name || ""
              )
                .toLowerCase()
                .trim();


            const matchesSearch =
              !searchText ||
              productName.includes(
                searchText
              );


            return matchesSearch;

          }
        );


      /* PRICE LOW TO HIGH */

      if (sort === "low") {

        result.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );

      }


      /* PRICE HIGH TO LOW */

      if (sort === "high") {

        result.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );

      }


      /* BEST RATED */

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
      search,
      sort,
    ]);


  /* =====================================================
     BEST SELLERS
===================================================== */

  const bestSellers =
    products.filter(
      (product) =>
        product.badge ===
        "BEST SELLER"
    );


  /* =====================================================
     CATEGORY
===================================================== */

  const handleCategoryChange =
    (item) => {

      setCategory(item);

    };


  /* =====================================================
     RETURN
===================================================== */

  return (

    <main className="divya-shop">

      <section className="shop-container">


        {/* =================================================
            CATEGORIES
        ================================================= */}

        <div className="category-scroll">

          {categories.map(
            (item) => (

              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleCategoryChange(
                    item
                  )
                }
              >
                {item}
              </button>

            )
          )}

        </div>


        {/* =================================================
            BEST SELLERS
        ================================================= */}

        {category === "All" &&
          !search && (

            <section className="best-seller-section">

              <div className="jewellery-grid best-grid">

                {bestSellers.map(
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

            </section>

          )}


        {/* =================================================
            ALL PRODUCTS
        ================================================= */}

        <section className="all-products-section">


          {/* =================================================
              PRODUCTS
          ================================================= */}

          {loading ? (

            <div className="shop-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading jewellery...
              </p>

            </div>

          ) : filteredProducts.length > 0 ? (

            <div className="jewellery-grid">

              {filteredProducts.map(
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

            <div className="no-products">

              <div>
                ⌕
              </div>


              <h3>
                No Jewellery Found
              </h3>


              <p>

                No products found for

                <strong>
                  {" "}
                  "{search}"
                </strong>

              </p>


              <button
                type="button"
                onClick={() => {

                  setCategory("All");

                  setSearchParams({});

                }}
              >
                View All Products
              </button>

            </div>

          )}

        </section>

      </section>

    </main>

  );
}


export default Shop;
