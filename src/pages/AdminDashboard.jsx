import { useEffect, useState } from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // ================= BANNERS =================

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

  const [banners, setBanners] = useState(defaultBanners);

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


  // ================= ORDERS LOAD =================

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/orders/admin/all"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Orders fetch failed");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Admin Orders Fetch Error:", error);
      setOrders([]);
    }
  };

  fetchOrders();
}, []);

  // ================= BANNERS LOAD =================


  // ================= PRODUCT DELETE =================

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


  // ================= BANNER INPUT CHANGE =================

  const handleBannerChange = (id, field, value) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? {
              ...banner,
              [field]: value,
            }
          : banner
      )
    );
  };

  // ================= BANNER IMAGE =================

  const handleBannerImage = (id, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target.result;

      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === id
            ? {
                ...banner,
                image: imageData,
              }
            : banner
        )
      );
    };

    reader.readAsDataURL(file);
  };

  // ================= SAVE BANNER =================

// ================= SAVE BANNER =================

const saveBanner = () => {
  alert("Banner save API abhi connect nahi hai.");
};

  // ================= RESET BANNERS =================

  const resetBanners = () => {
  const confirmReset = window.confirm(
    "Are you sure you want to reset all banners?"
  );

  if (!confirmReset) return;

  setBanners(defaultBanners);
};

  // ================= LOGOUT =================

const handleLogout = () => {
  navigate("/admin");
};

  return (
    <div className="admin-dashboard">

      {/* ================= SIDEBAR ================= */}

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

        {/* ================= TOP ================= */}

        <div className="admin-top">

          <div>

            <h2>
              Dashboard
            </h2>

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

        {/* ================= STATS ================= */}

        <div className="admin-stats">

          {/* TOTAL PRODUCTS */}

          <div className="stat-card">

            <div className="stat-icon">
              📦
            </div>

            <div>

              <span>
                Total Products
              </span>

              <strong>
                {products.length}
              </strong>

            </div>

          </div>

          {/* IN STOCK */}

          <div className="stat-card">

            <div className="stat-icon green">
              🟢
            </div>

            <div>

              <span>
                In Stock
              </span>

              <strong>
                {
                  products.filter(
                    (product) =>
                      Number(product.stock) > 0
                  ).length
                }
              </strong>

            </div>

          </div>

          {/* CATEGORIES */}

          <div className="stat-card">

            <div className="stat-icon pink">
              💰
            </div>

            <div>

              <span>
                Categories
              </span>

              <strong>
                {
                  new Set(
                    products.map(
                      (product) =>
                        product.category
                    )
                  ).size
                }
              </strong>

            </div>

          </div>

          {/* TOTAL ORDERS */}

          <div className="stat-card">

            <div className="stat-icon">
              🛒
            </div>

            <div>

              <span>
                Total Orders
              </span>

              <strong>
                {orders.length}
              </strong>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
