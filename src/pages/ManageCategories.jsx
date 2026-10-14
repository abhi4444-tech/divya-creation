
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Categories load nahi hui.");
      }

      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message || "Backend se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Category ka naam enter kar bhai.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editId
        ? `${API_URL}/api/categories/${editId}`
        : `${API_URL}/api/categories`;

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Category save nahi hui.");
      }

      setName("");
      setEditId(null);
      await fetchCategories();

      alert(data.message || "Category save ho gayi!");
    } catch (err) {
      setError(err.message || "Category save nahi hui.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setName(category.name);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setError("");
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `"${category.name}" category delete karni hai?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/categories/${category.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Category delete nahi hui.");
      }

      if (editId === category.id) {
        cancelEdit();
      }

      await fetchCategories();
      alert(data.message || "Category delete ho gayi!");
    } catch (err) {
      setError(err.message || "Category delete nahi hui.");
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h1>Divya</h1>
          <span>CREATION</span>
        </div>

        <div className="admin-menu">
          <Link to="/admin/dashboard" className="admin-menu-item">
            📊 Dashboard
          </Link>

          <Link to="/admin/products" className="admin-menu-item">
            📦 Products
          </Link>

          <Link
            to="/admin/categories"
            className="admin-menu-item active"
          >
            🗂️ Manage Categories
          </Link>

          <Link to="/admin/add-product" className="admin-menu-item">
            ➕ Add Product
          </Link>

          <Link to="/" className="admin-menu-item">
            🏠 View Website
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div>
            <h2>Manage Categories</h2>
            <p>Add, edit aur delete your product categories.</p>
          </div>
        </div>

        <section
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3>{editId ? "Edit Category" : "Add New Category"}</h3>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="category-name"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Category Name
            </label>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <input
                id="category-name"
                type="text"
                value={name}
                maxLength={100}
                placeholder="e.g. Wedding Gifts"
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  flex: "1 1 240px",
                  minWidth: 0,
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "7px",
                  fontSize: "15px",
                }}
              />

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "7px",
                  background: "#e91e63",
                  color: "#fff",
                  cursor: saving ? "wait" : "pointer",
                  fontWeight: 600,
                }}
              >
                {saving
                  ? "Saving..."
                  : editId
                  ? "Update Category"
                  : "+ Add Category"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #ddd",
                    borderRadius: "7px",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && (
            <p style={{ color: "#c62828", marginTop: "15px" }}>
              {error}
            </p>
          )}
        </section>

        <section
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3>All Categories ({categories.length})</h3>

          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>Abhi koi category nahi hai. Pehli category add kar.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f7f7f7" }}>
                    <th style={{ padding: "13px" }}>ID</th>
                    <th style={{ padding: "13px" }}>Category Name</th>
                    <th style={{ padding: "13px" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={{ padding: "13px", borderBottom: "1px solid #eee" }}>
                        {category.id}
                      </td>

                      <td style={{ padding: "13px", borderBottom: "1px solid #eee" }}>
                        {category.name}
                      </td>

                      <td style={{ padding: "13px", borderBottom: "1px solid #eee" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#ffebee",
                              color: "#c62828",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageCategories;
