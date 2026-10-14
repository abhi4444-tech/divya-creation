import React from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  addToCart,
  buyNow,
  wishlist,
  addToWishlist,
  removeFromWishlist,
}) {
  const navigate = useNavigate();

  const productId = Number(product?.id);

  /* =====================================================
     WISHLIST STATUS
  ===================================================== */

  const isWishlisted =
    wishlist?.some(
      (item) =>
        Number(item.id) === productId
    );

  /* =====================================================
     IMAGES
  ===================================================== */

  const images =
    Array.isArray(product?.images)
      ? product.images
      : [];

  const mainImage =
    product?.image ||
    images[0] ||
    "";

  const hoverImage =
    images[1] ||
    mainImage;

  /* =====================================================
     STOCK
  ===================================================== */

  const outOfStock =
    Number(product?.stock) <= 0;

  /* =====================================================
     OPEN PRODUCT DETAILS
  ===================================================== */

  const openProductDetails = () => {
    if (!productId) {
      console.error(
        "Product ID missing:",
        product
      );
      return;
    }

    navigate(`/product/${productId}`);
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  /* =====================================================
     CART
  ===================================================== */

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      return;
    }

    addToCart(product);
  };

  /* =====================================================
     BUY
  ===================================================== */

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      return;
    }

    buyNow(product);
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <article className="product-card">

      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="product-image"
        onClick={openProductDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === " "
          ) {
            e.preventDefault();
            openProductDetails();
          }
        }}
      >

        <div className="product-images-wrapper">

          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="admin-product-home-image main-product-image"
            />
          ) : (
            <div className="product-placeholder">
              💎
            </div>
          )}

          {hoverImage &&
            hoverImage !== mainImage && (
              <img
                src={hoverImage}
                alt={product.name}
                className="admin-product-home-image hover-product-image"
              />
            )}

        </div>

        {/* =================================================
            SALE BADGE
        ================================================= */}

        {product.oldPrice &&
          Number(product.oldPrice) >
            Number(product.price) && (
            <div className="sale-badge">
              SALE
            </div>
          )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        <button
          type="button"
          className={`wishlist-btn ${
            isWishlisted ? "active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="product-hover-actions">

          <button
            type="button"
            className="hover-cart-btn"
            onClick={handleCart}
            disabled={outOfStock}
          >
            {outOfStock
              ? "OUT OF STOCK"
              : "ADD TO CART"}
          </button>

          <button
            type="button"
            className="hover-buy-btn"
            onClick={handleBuy}
            disabled={outOfStock}
          >
            BUY NOW
          </button>

        </div>

      </div>

      {/* =================================================
          PRODUCT INFO
      ================================================= */}

      <div className="product-info">

        <h3
          onClick={openProductDetails}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              e.preventDefault();
              openProductDetails();
            }
          }}
        >
          {product.name}
        </h3>

        {/* =================================================
            RATING
        ================================================= */}

        <div className="rating">

          {product.rating !== "New" ? (
            <>
              ⭐ {product.rating}
            </>
          ) : (
            <span>
              New
            </span>
          )}

        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="price">

          <strong>
            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}
          </strong>

          {product.oldPrice &&
            Number(product.oldPrice) >
              Number(product.price) && (
              <del>
                ₹
                {Number(
                  product.oldPrice
                ).toLocaleString("en-IN")}
              </del>
            )}

          {product.oldPrice &&
            Number(product.oldPrice) >
              Number(product.price) && (
              <span>
                {Math.round(
                  (
                    (
                      Number(product.oldPrice) -
                      Number(product.price)
                    ) /
                    Number(product.oldPrice)
                  ) * 100
                )}
                % OFF
              </span>
            )}

        </div>

        {/* =================================================
            OUT OF STOCK
        ================================================= */}

        {outOfStock && (
          <div className="out-of-stock-text">
            Out of Stock
          </div>
        )}

      </div>

    </article>
  );
}

export default ProductCard;
