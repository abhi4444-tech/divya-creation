import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  // =====================================================
  // PRODUCT STATES
  // =====================================================

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");

  // =====================================================
  // PAGE STATES
  // =====================================================

  const [pages, setPages] = useState(["new-arrivals"]);

  // =====================================================
  // IMAGES
  // =====================================================

  const [images, setImages] = useState([]);

  const fileInputRef = useRef(null);

  // =====================================================
  // LOADING
  // =====================================================

  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // =====================================================
  // LOAD PRODUCT FOR EDIT
  // =====================================================

  useEffect(() => {
    if (!editId) return;

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);

        const response = await fetch(
          `${API_URL}/api/products/${editId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Product fetch failed"
          );
        }

        const product = data.product;

        // ---------------- PRODUCT INFO ----------------

        setName(product.name || "");
        setPrice(product.price ?? "");

        setOldPrice(
          product.oldPrice !== null &&
          product.oldPrice !== undefined
            ? product.oldPrice
            : ""
        );

        setCategory(product.category || "");
        setStock(product.stock ?? "");

        setRating(
          product.rating === "New" ||
          product.rating === null ||
          product.rating === undefined
            ? ""
            : product.rating
        );

        setDescription(product.description || "");

        // ---------------- PAGES ----------------

        let loadedPages = [];

        if (Array.isArray(product.pages)) {
          loadedPages = product.pages;
        } else if (typeof product.pages === "string") {
          try {
            const parsed = JSON.parse(product.pages);

            if (Array.isArray(parsed)) {
              loadedPages = parsed;
            }
          } catch {
            loadedPages = [];
          }
        }

        // Backward compatibility
        if (
          loadedPages.length === 0 &&
          product.page
        ) {
          loadedPages = [product.page];
        }

        // Only valid pages
        const allowedPages = [
          "home",
          "new-arrivals",
          "best-sellers",
          "shop",
        ];

        loadedPages = [
          ...new Set(
            loadedPages.filter((page) =>
              allowedPages.includes(page)
            )
          ),
        ];

        setPages(loadedPages);

        // ---------------- IMAGES ----------------

        let loadedImages = [];

        if (Array.isArray(product.images)) {
          loadedImages = product.images.filter(Boolean);
        } else if (typeof product.images === "string") {
          try {
            const parsed = JSON.parse(product.images);

            if (Array.isArray(parsed)) {
              loadedImages = parsed.filter(Boolean);
            }
          } catch {
            loadedImages = [];
          }
        }

        // If images array is empty, use old image field
        if (
          loadedImages.length === 0 &&
          product.image
        ) {
          loadedImages = [product.image];
        }

        setImages(loadedImages);
      } catch (error) {
        console.error(
          "Edit Product Load Error:",
          error
        );

        alert(
          error.message ||
            "Product load failed"
        );

        navigate("/admin/dashboard");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [editId, navigate]);

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const handlePageChange = (pageName) => {
    setPages((previousPages) => {
      if (previousPages.includes(pageName)) {
        return previousPages.filter(
          (page) => page !== pageName
        );
      }

      return [...previousPages, pageName];
    });
  };

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          reject(
            new Error(`${file.name} is not an image`)
          );
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(
            new Error(
              `Failed to read ${file.name}`
            )
          );
        };

        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then((newImages) => {
        setImages((previousImages) => [
          ...previousImages,
          ...newImages,
        ]);
      })
      .catch((error) => {
        console.error(
          "Image upload error:",
          error
        );

        alert("Image upload failed!");
      })
      .finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (indexToRemove) => {
    setImages((previousImages) =>
      previousImages.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // =====================================================
  // MAKE IMAGE MAIN
  // =====================================================

  const makeMainImage = (indexToMakeMain) => {
    setImages((previousImages) => {
      if (
        indexToMakeMain < 0 ||
        indexToMakeMain >= previousImages.length ||
        indexToMakeMain === 0
      ) {
        return previousImages;
      }

      const selectedImage =
        previousImages[indexToMakeMain];

      const remainingImages =
        previousImages.filter(
          (_, index) =>
            index !== indexToMakeMain
        );

      return [
        selectedImage,
        ...remainingImages,
      ];
    });
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ---------------- VALIDATION ----------------

    if (!name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (
      price === "" ||
      Number(price) < 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (images.length === 0) {
      alert(
        "Please upload at least one product image!"
      );
      return;
    }

    if (pages.length === 0) {
      alert(
        "Please select at least one page."
      );
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // PRODUCT DATA
      // =================================================

      const productData = {
        name: name.trim(),

        price: Number(price),

        oldPrice:
          oldPrice !== ""
            ? Number(oldPrice)
            : null,

        category,

        stock:
          stock !== ""
            ? Number(stock)
            : 0,

        rating:
          rating !== ""
            ? Number(rating)
            : null,

        description:
          description.trim(),

        // ONLY SELECTED PAGES
        pages: [...pages],

        // FIRST IMAGE IS ALWAYS MAIN IMAGE
        image: images[0],

        // ALL IMAGES
        images: [...images],
      };

      console.log(
        "Sending product data:",
        {
          ...productData,
          images: `${images.length} images`,
        }
      );

      // =================================================
      // URL / METHOD
      // =================================================

      const url = isEditMode
        ? `${API_URL}/api/products/${editId}`
        : `${API_URL}/api/products`;

      const method = isEditMode
        ? "PUT"
        : "POST";

      // =================================================
      // API
      // =================================================

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            productData
          ),
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
            "Product save failed"
        );
      }

      alert(
        isEditMode
          ? "Product updated successfully! ✅"
          : "Product added successfully! ✅"
      );

      navigate(
        "/admin/dashboard"
      );
    } catch (error) {
      console.error(
        "Product Save Error:",
        error
      );

      alert(
        error.message ||
          "Product save failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING EDIT PRODUCT
  // =====================================================

  if (
    isEditMode &&
    loadingProduct
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Loading product...
      </div>
    );
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-logo">
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <div className="admin-menu">

          <a
            href="/admin/dashboard"
            className="admin-menu-item"
          >
            📊 Dashboard
          </a>

          <a
            href="/admin/add-product"
            className="admin-menu-item active"
          >
            ➕ Add Product
          </a>

          <a
            href="/"
            className="admin-menu-item"
          >
            🏠 View Website
          </a>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* =================================================
            TOP
        ================================================= */}

        <div className="admin-top">

          <div>

            <h2>
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p>
              {isEditMode
                ? "Update your existing product"
                : "Add a new product to your store"}
            </p>

          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="add-product-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              IMAGES
          ================================================= */}

          <div className="form-section">

            <h3>
              Product Images
            </h3>

            {/* =================================================
                UPLOAD AREA
            ================================================= */}

            <div className="image-upload-area">

              <div
                className="upload-placeholder"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <span>
                  🖼️
                </span>

                <p>
                  Choose product images
                </p>

                <small>
                  You can select multiple images
                </small>

                <small
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#777",
                  }}
                >
                  Click here and select multiple
                  images
                </small>

              </div>

              {/* FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImages}
              />

            </div>

            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

            {images.length > 0 && (
              <div
                style={{
                  marginTop: "15px",
                  width: "220px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#fafafa",
                  boxSizing: "border-box",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >

                  {images.map((image, index) => (

                    <div
                      key={index}
                      style={{
                        position: "relative",
                        width: "60px",
                        height: "60px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >

                      {/* IMAGE */}

                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      {/* MAIN LABEL */}

                      {index === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "3px",
                            left: "3px",
                            background: "#111",
                            color: "#fff",
                            padding: "2px 4px",
                            borderRadius: "3px",
                            fontSize: "8px",
                            fontWeight: "600",
                            zIndex: 2,
                          }}
                        >
                          Main
                        </span>
                      )}

                      {/* MAKE MAIN */}

                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            makeMainImage(index)
                          }
                          style={{
                            position: "absolute",
                            bottom: "3px",
                            left: "3px",
                            right: "3px",
                            height: "18px",
                            border: "none",
                            borderRadius: "3px",
                            background: "#e91e63",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "8px",
                            fontWeight: "600",
                            padding: 0,
                            zIndex: 3,
                          }}
                        >
                          Make Main
                        </button>
                      )}

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        style={{
                          position: "absolute",
                          top: "3px",
                          right: "3px",
                          width: "18px",
                          height: "18px",
                          border: "none",
                          borderRadius: "50%",
                          background: "#e53935",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "12px",
                          lineHeight: "18px",
                          padding: 0,
                          zIndex: 4,
                        }}
                      >
                        ×
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="form-section">

            <h3>
              Product Information
            </h3>

            <div className="form-grid">

              {/* NAME */}

              <div className="form-group full">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  placeholder="599"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* OLD PRICE */}

              <div className="form-group">

                <label>
                  Old Price (₹)
                </label>

                <input
                  type="number"
                  placeholder="899"
                  min="0"
                  value={oldPrice}
                  onChange={(e) =>
                    setOldPrice(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  <option value="Personalized Gifts">
                    Personalized Gifts
                  </option>

                  <option value="Photo Frames">
                    Photo Frames
                  </option>

                  <option value="Gift Hampers">
                    Gift Hampers
                  </option>

                  <option value="Birthday Gifts">
                    Birthday Gifts
                  </option>

                  <option value="Anniversary Gifts">
                    Anniversary Gifts
                  </option>

                  <option value="Couple Gifts">
                    Couple Gifts
                  </option>

                </select>

              </div>

              {/* STOCK */}

              <div className="form-group">

                <label>
                  Stock
                </label>

                <input
                  type="number"
                  placeholder="20"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* RATING */}

              <div className="form-group">

                <label>
                  Rating
                </label>

                <input
                  type="number"
                  placeholder="4.8"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) =>
                    setRating(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* =================================================
                  CHOOSE PAGE
              ================================================= */}

              <div className="form-group full">

                <label>
                  Choose Page
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginTop: "10px",
                  }}
                >

                  {/* HOME */}

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={pages.includes(
                        "home"
                      )}
                      onChange={() =>
                        handlePageChange(
                          "home"
                        )
                      }
                    />

                    Home

                  </label>

                  {/* NEW ARRIVALS */}

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={pages.includes(
                        "new-arrivals"
                      )}
                      onChange={() =>
                        handlePageChange(
                          "new-arrivals"
                        )
                      }
                    />

                    New Arrivals

                  </label>

                  {/* BEST SELLERS */}

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={pages.includes(
                        "best-sellers"
                      )}
                      onChange={() =>
                        handlePageChange(
                          "best-sellers"
                        )
                      }
                    />

                    Best Sellers

                  </label>

                  {/* SHOP */}

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={pages.includes(
                        "shop"
                      )}
                      onChange={() =>
                        handlePageChange(
                          "shop"
                        )
                      }
                    />

                    Shop

                  </label>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group full">

                <label>
                  Description
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter product description..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="form-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-product-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "✓ Update Product"
                : "+ Add Product"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AddProduct;
