import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  LoaderCircle,
  House,
  BriefcaseBusiness,
} from "lucide-react";
import "../css/SavedAddresses.css";

const API_URL = "http://localhost:5000/api/addresses";

const emptyForm = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function SavedAddresses() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!authLoading && !user?.id) {
      navigate("/login", {
        state: { redirectTo: "/saved-addresses" },
        replace: true,
      });
    }
  }, [authLoading, user?.id, navigate]);

  const loadAddresses = useCallback(async () => {
    if (!user?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(user.id)}`,
        { credentials: "include" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          navigate("/login", {
            state: { redirectTo: "/saved-addresses" },
            replace: true,
          });
        }

        throw new Error(data.message || "Could not load addresses");
      }

      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadAddresses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user?.id, loadAddresses]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);

    setForm({
      label: address.label || "Home",
      recipient_name: address.recipient_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setError("");
    setNotice("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      navigate("/login", {
        state: { redirectTo: "/saved-addresses" },
        replace: true,
      });
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        recipient_name: form.recipient_name.trim(),
        phone: form.phone.trim(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      const response = await fetch(
        editingId ? `${API_URL}/edit/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          navigate("/login", {
            state: { redirectTo: "/saved-addresses" },
            replace: true,
          });
        }

        throw new Error(data.message || "Could not save address");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setNotice(data.message || "Address saved successfully");

      await loadAddresses();
    } catch (err) {
      setError(err.message || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (address) => {
    const confirmed = window.confirm(
      `Delete the ${address.label || "saved"} address?`
    );

    if (!confirmed) return;

    if (!user?.id) {
      navigate("/login", {
        state: { redirectTo: "/saved-addresses" },
        replace: true,
      });
      return;
    }

    setActionId(address.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${address.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          navigate("/login", {
            state: { redirectTo: "/saved-addresses" },
            replace: true,
          });
        }

        throw new Error(data.message || "Could not delete address");
      }

      setNotice(data.message || "Address deleted successfully");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Could not delete address.");
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (address) => {
    if (!user?.id) {
      navigate("/login", {
        state: { redirectTo: "/saved-addresses" },
        replace: true,
      });
      return;
    }

    setActionId(address.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/default/${address.id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          navigate("/login", {
            state: { redirectTo: "/saved-addresses" },
            replace: true,
          });
        }

        throw new Error(data.message || "Could not set default address");
      }

      setNotice(data.message || "Default address updated");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Could not set default address.");
    } finally {
      setActionId(null);
    }
  };

  if (authLoading || !user?.id) {
    return (
      <div className="saved-addresses-loading">
        <LoaderCircle className="saved-addresses-spinner" size={28} />
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <section className="saved-addresses-page">
      <div className="saved-addresses-container">
        <div className="saved-addresses-heading">
          <div>
            <span className="saved-addresses-eyebrow">
              YOUR ACCOUNT
            </span>
            <h1>Saved Addresses</h1>
            <p>Manage the addresses where you receive your orders.</p>
          </div>

          <button
            type="button"
            className="saved-addresses-add-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add New Address
          </button>
        </div>

        {error && (
          <div className="saved-addresses-message error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="saved-addresses-message success" role="status">
            {notice}
          </div>
        )}

        {showForm && (
          <div className="saved-addresses-form-card">
            <div className="saved-addresses-form-heading">
              <div>
                <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
                <p>Enter your delivery details below.</p>
              </div>

              <button
                type="button"
                className="saved-addresses-close-btn"
                onClick={closeForm}
                aria-label="Close form"
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="saved-addresses-label-options">
                {[
                  { value: "Home", icon: House },
                  { value: "Work", icon: BriefcaseBusiness },
                  { value: "Other", icon: MapPin },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      form.label === value
                        ? "saved-addresses-label active"
                        : "saved-addresses-label"
                    }
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        label: value,
                      }))
                    }
                  >
                    <Icon size={17} />
                    {value}
                  </button>
                ))}
              </div>

              <div className="saved-addresses-fields">
                <label>
                  Full Name *
                  <input
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Mobile Number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    required
                  />
                </label>

                <label className="full-width">
                  Address Line 1 *
                  <input
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleChange}
                    maxLength={255}
                    autoComplete="address-line1"
                    placeholder="House no., building, street"
                    required
                  />
                </label>

                <label className="full-width">
                  Address Line 2
                  <input
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                    maxLength={255}
                    autoComplete="address-line2"
                    placeholder="Area, colony (optional)"
                  />
                </label>

                <label>
                  Landmark
                  <input
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="Near a landmark (optional)"
                  />
                </label>

                <label>
                  PIN Code *
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="postal-code"
                    required
                  />
                </label>

                <label>
                  City *
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="address-level2"
                    required
                  />
                </label>

                <label>
                  State *
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="address-level1"
                    required
                  />
                </label>
              </div>

              <div className="saved-addresses-form-actions">
                <button
                  type="button"
                  className="saved-addresses-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="saved-addresses-submit-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="saved-addresses-loading">
            <LoaderCircle className="saved-addresses-spinner" size={28} />
            <p>Loading saved addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="saved-addresses-empty">
            <div className="saved-addresses-empty-icon">
              <MapPin size={30} />
            </div>
            <h2>No saved addresses yet</h2>
            <p>Add your home or work address to make checkout easier.</p>
            <button
              type="button"
              className="saved-addresses-add-btn"
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="saved-addresses-grid">
            {addresses.map((address) => (
              <article className="saved-address-card" key={address.id}>
                <div className="saved-address-card-top">
                  <span className="saved-address-type">
                    {address.label === "Work" ? (
                      <BriefcaseBusiness size={17} />
                    ) : address.label === "Home" ? (
                      <House size={17} />
                    ) : (
                      <MapPin size={17} />
                    )}
                    {address.label || "Other"}
                  </span>

                  {Number(address.is_default) === 1 && (
                    <span className="saved-address-default-badge">
                      <Star size={13} fill="currentColor" />
                      Default
                    </span>
                  )}
                </div>

                <h3>{address.recipient_name}</h3>
                <p className="saved-address-phone">{address.phone}</p>

                <p className="saved-address-text">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                  {address.landmark && `, Near ${address.landmark}`}
                  {`, ${address.city}, ${address.state} - ${address.pincode}`}
                </p>

                <div className="saved-address-card-actions">
                  {Number(address.is_default) !== 1 && (
                    <button
                      type="button"
                      className="saved-address-action default-action"
                      onClick={() => handleSetDefault(address)}
                      disabled={actionId !== null}
                    >
                      <Star size={15} />
                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    className="saved-address-action"
                    onClick={() => openEditForm(address)}
                    disabled={actionId !== null}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="saved-address-action delete-action"
                    onClick={() => handleDelete(address)}
                    disabled={actionId !== null}
                  >
                    <Trash2 size={15} />
                    {actionId === address.id ? "Please wait..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SavedAddresses;