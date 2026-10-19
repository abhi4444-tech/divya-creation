import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {useParams, useNavigate,useLocation,} from "react-router-dom";
import ProductReviews from "./ProductReviews";
import "../css/ProductReviews.css";
import "../css/productDetails.css";
const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [readMore, setReadMore] = useState(false);

 useEffect(() => {
  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Product fetch failed"
        );
      }

      const foundProduct = data.product;

      if (foundProduct) {
        setProduct(foundProduct);

        const productImages =
          foundProduct.images?.length
            ? foundProduct.images
            : foundProduct.image
            ? [foundProduct.image]
            : [];

        setSelectedImage(
          productImages[0] || ""
        );
      }

    } catch (error) {
      console.error(
        "Product details error:",
        error
      );

      setProduct(null);
    }
  };

  fetchProduct();
}, [id]);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const images =
    product.images?.length
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const discount =
    product.oldPrice &&
    Number(product.oldPrice) > Number(product.price)
      ? Math.round(
          ((Number(product.oldPrice) - Number(product.price)) /
            Number(product.oldPrice)) *
            100
        )
      : 0;
//======================
//addToCart
//======================
const addToCart = async () => {
  if (!user?.id) {
    navigate("/login", {
      state: { redirectTo: location.pathname },
    });
    return;
  }

  const productId = Number(product?.id);
  const requestedQuantity = Number(quantity);

  if (!productId) {
    alert("Product ID not found.");
    return;
  }

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    alert("Please select a valid quantity.");
    return;
  }

  if (Number(product.stock) < requestedQuantity) {
    alert("Selected quantity is not available.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/cart`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(user.id),
          productId,
          quantity: requestedQuantity,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to add product to cart."
      );
    }

    window.dispatchEvent(new Event("cartUpdated"));
    alert("Product added to cart! 🛒");
  } catch (error) {
    console.error("Add to Cart Error:", error);

    alert(
      error.message || "Unable to add product to cart."
    );
  }
};

//=====================
//buyNow
//=============
const buyNow = () => {
  if (Number(product?.stock || 0) <= 0) {
    alert("Product is out of stock!");
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


  return (
    <div className="product-details-page">

      <div className="product-details-container">

        {/* =====================================================
            LEFT - PRODUCT GALLERY
        ====================================================== */}

        <div className="product-gallery">

          <div className="product-thumbnails">

            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                className={
                  selectedImage === img
                    ? "thumbnail active"
                    : "thumbnail"
                }
                onClick={() =>
                  setSelectedImage(img)
                }
                aria-label={`View product image ${
                  index + 1
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                />
              </button>
            ))}

          </div>

          <div className="main-product-image">

            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
              />
            ) : (
              <div className="no-product-image">
                🎁
              </div>
            )}

          </div>

        </div>


        {/* =====================================================
            RIGHT - PRODUCT DETAILS
        ====================================================== */}

        <div className="product-info-panel">

          {/* PRODUCT TITLE */}

          <h1 className="product-title">
            {product.name}
          </h1>


          {/* RATING */}

          <div className="product-rating">
            ⭐ {product.rating || "New"}
          </div>


          {/* PRICE */}

          <div className="product-price">

            <strong>
              ₹{product.price}
            </strong>

            {product.oldPrice && (
              <del>
                ₹{product.oldPrice}
              </del>
            )}

            {discount > 0 && (
              <span>
                {discount}% OFF
              </span>
            )}

          </div>


          {/* PRODUCT BENEFITS */}

<div className="product-benefits">

  <div className="product-benefits-grid">

    <div className="product-benefit">
      <div className="benefit-icon">
        ₹
      </div>

      <strong>
        Cash on<br />Delivery
      </strong>
    </div>


    <div className="product-benefit">
      <div className="benefit-icon">
        ⇅
      </div>

      <strong>
        Exchange Only<br />within 5 days
      </strong>
    </div>


    <div className="product-benefit">
      <div className="benefit-icon">
        🚚
      </div>

      <strong>
        Free Delivery
      </strong>
    </div>

  </div>


  <div className="product-delivery-strip">
    Get it delivered in 3-6 days
  </div>

</div>




          {/* DELIVERY */}
{/* 
          <div className="delivery-info">

            <p>
              🚚 <strong>Free Delivery</strong>
            </p>

            <p>
              ✓ Cash on Delivery Available
            </p>

            <p>
              ✓ Secure & Safe Packaging
            </p>

          </div> */}


          {/* STOCK */}

          <div
            className={
              Number(product.stock) > 0
                ? "stock-info"
                : "stock-info out-of-stock"
            }
          >
            {Number(product.stock) > 0
              ? `${product.stock} items available`
              : "Out of Stock"}
          </div>


          {/* QUANTITY */}

          {Number(product.stock) > 0 && (
            <div className="quantity-section">

              <span className="quantity-label">
                Quantity
              </span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        Number(product.stock),
                        quantity + 1
                      )
                    )
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>
          )}


          {/* ACTION BUTTONS */}

          <div className="product-action-buttons">

            <button
              type="button"
              className="detail-cart-btn"
              disabled={
                Number(product.stock) <= 0
              }
              onClick={addToCart}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="detail-buy-btn"
              disabled={
                Number(product.stock) <= 0
              }
              onClick={buyNow}
            >
              Buy Now
            </button>

          </div>


          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}

          <section className="detail-section">

            <h2>
              Product Information
            </h2>

            <div className="information-grid">

              <div>
                <span>Brand</span>
                <strong>
                  {product.brand ||
                    "Divya Creation"}
                </strong>
              </div>

              <div>
                <span>Country Of Origin</span>
                <strong>
                  {product.countryOfOrigin ||
                    "India"}
                </strong>
              </div>

              <div>
                <span>Ideal For</span>
                <strong>
                  {product.idealFor ||
                    "Everyone"}
                </strong>
              </div>

              <div>
                <span>Pack Of</span>
                <strong>
                  {product.packOf || "1"}
                </strong>
              </div>

              <div>
                <span>Type</span>
                <strong>
                  {product.type ||
                    product.category ||
                    "Gift"}
                </strong>
              </div>

              {product.size && (
                <div>
                  <span>Size</span>
                  <strong>
                    {product.size}
                  </strong>
                </div>
              )}

            </div>

          </section>


          {/* =================================================
              PRODUCT DESCRIPTION
          ================================================== */}

          <section className="detail-section description-section">

            <h2>
              Product Description
            </h2>

            <div
              className={
                readMore
                  ? "description-text expanded"
                  : "description-text"
              }
            >
              {product.description ||
                "Beautiful handmade product carefully created for your special moments."}
            </div>

            <button
              type="button"
              className="read-more-btn"
              onClick={() =>
                setReadMore((prev) => !prev)
              }
            >
              {readMore
                ? "Read Less"
                : "Read More"}
            </button>

          </section>

        </div>
      </div>
      {/* =================================================
          PRODUCT REVIEWS
      ================================================== */}

      <ProductReviews
        productId={product.id}
        product={product}
      />
    </div>
  );
}

export default ProductDetails;
