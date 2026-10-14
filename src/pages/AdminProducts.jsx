import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);

  // ================= PRODUCTS LOAD =================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Products fetch failed"
          );
        }

        setProducts(data.products || []);

      } catch (error) {
        console.error(
          "Admin Products Fetch Error:",
          error
        );

        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  // ================= DELETE PRODUCT =================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Product delete failed"
        );
      }

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.id !== id
        )
      );

      alert("Product deleted successfully!");

    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      alert(
        error.message ||
          "Product delete failed"
      );
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    navigate("/admin");
  };

  return (
    <div className="admin-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-sidebar-logo">
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        {/* MAIN MENU */}

        <nav className="admin-menu">

          <Link
            to="/admin/dashboard"
            className={`admin-menu-item ${
              location.pathname === "/admin/dashboard"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/products"
            className={`admin-menu-item ${
              location.pathname === "/admin/products"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">📦</span>
            <span>Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-menu-item ${
              location.pathname === "/admin/orders"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🛒</span>
            <span>Orders</span>
          </Link>

          <Link
            to="/admin/customers"
            className={`admin-menu-item ${
              location.pathname === "/admin/customers"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">👥</span>
            <span>Customers</span>
          </Link>

          <Link
            to="/admin/inventory"
            className={`admin-menu-item ${
              location.pathname === "/admin/inventory"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">📊</span>
            <span>Inventory</span>
          </Link>

          <Link
            to="/admin/categories"
            className={`admin-menu-item ${
              location.pathname === "/admin/categories"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🗂️</span>
            <span>Categories</span>
          </Link>

          <Link
            to="/admin/coupons"
            className={`admin-menu-item ${
              location.pathname === "/admin/coupons"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🎟️</span>
            <span>Coupons</span>
          </Link>

          <Link
            to="/admin/payments"
            className={`admin-menu-item ${
              location.pathname === "/admin/payments"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">💳</span>
            <span>Payments</span>
          </Link>

          <Link
            to="/admin/reviews"
            className={`admin-menu-item ${
              location.pathname === "/admin/reviews"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">⭐</span>
            <span>Reviews</span>
          </Link>

          <Link
            to="/admin/analytics"
            className={`admin-menu-item ${
              location.pathname === "/admin/analytics"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">📈</span>
            <span>Analytics</span>
          </Link>

          <Link
            to="/admin/marketing"
            className={`admin-menu-item ${
              location.pathname === "/admin/marketing"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">📣</span>
            <span>Marketing</span>
          </Link>

          <Link
            to="/admin/shipping"
            className={`admin-menu-item ${
              location.pathname === "/admin/shipping"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🚚</span>
            <span>Shipping</span>
          </Link>

          <Link
            to="/admin/customize-banner"
            className={`admin-menu-item ${
              location.pathname === "/admin/customize-banner"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">🖼️</span>
            <span>Customize Banner</span>
          </Link>

        </nav>

        {/* BOTTOM MENU */}

        <div className="admin-sidebar-bottom">

          <Link
            to="/admin/settings"
            className={`admin-menu-item ${
              location.pathname === "/admin/settings"
                ? "active"
                : ""
            }`}
          >
            <span className="menu-icon">⚙️</span>
            <span>Settings</span>
          </Link>

          <button
            className="admin-menu-item admin-logout"
            onClick={handleLogout}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main">

        {/* TOP */}

        <div className="admin-top">

          <div>
            <h2>Products</h2>

            <p>
              Manage your Divya Creation products
            </p>
          </div>

          <Link
            to="/admin/add-product"
            className="add-product-button"
          >
            + Add Product
          </Link>

        </div>

        {/* ================= ALL PRODUCTS ================= */}

        <div className="products-admin-box">

          <div className="products-admin-header">

            <h3>
              All Products
            </h3>

            <span>
              {products.length} Products
            </span>

          </div>

          {products.length === 0 ? (

            <div className="no-products">

              <div>
                📦
              </div>

              <h3>
                No Products Yet
              </h3>

              <p>
                Add your first product to get started.
              </p>

              <Link
                to="/admin/add-product"
                className="add-product-button"
              >
                + Add Product
              </Link>

            </div>

          ) : (

            <div className="admin-product-list">

              {products.map((product) => (

                <div
                  className="admin-product-row"
                  key={product.id}
                >

                  {/* IMAGE */}

                  <div className="admin-product-image">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                      />

                    ) : (

                      <span>
                        🎁
                      </span>

                    )}

                  </div>

                  {/* NAME */}

                  <div className="admin-product-name">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category}
                    </span>

                  </div>

                  {/* PRICE */}

                  <div className="admin-product-price">

                    <strong>
                      ₹{product.price}
                    </strong>

                    {product.oldPrice && (
                      <del>
                        ₹{product.oldPrice}
                      </del>
                    )}

                  </div>

                  {/* STOCK */}

                  <div className="admin-product-stock">

                    {Number(product.stock) > 0 ? (

                      <span className="stock-available">

                        {product.stock} in stock

                      </span>

                    ) : (

                      <span className="stock-out">
                        Out of stock
                      </span>

                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-product-actions">

                    <Link
                      to={`/admin/add-product?edit=${product.id}`}
                      className="edit-btn"
                    >
                      ✏️
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(product.id)
                      }
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminProducts;
