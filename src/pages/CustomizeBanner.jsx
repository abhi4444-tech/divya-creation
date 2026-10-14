import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/customize-banner.css";

function CustomizeBanner() {
  const navigate = useNavigate();
  const defaultBanners = [
    {
      small: "HANDMADE WITH LOVE",
      title: "Make Every Moment\nSpecial",
      text: "Beautiful handmade & personalized gifts for every special occasion.",
      button: "SHOP NOW",
      link: "/products",
      image: "/banner1.png",
    },
    {
      small: "SPECIAL GIFTS",
      title: "Gifts Made\nWith Love",
      text: "Discover beautiful gifts for birthdays, anniversaries and every special moment.",
      button: "SHOP NOW",
      link: "/products",
      image: "/banner2.png",
    },
    {
      small: "PERSONALIZED FOR YOU",
      title: "Create Something\nSpecial",
      text: "Make your memories unforgettable with our personalized gifts.",
      button: "EXPLORE NOW",
      link: "/products",
      image: "/banner3.png",
    },
  ];

  const [banners, setBanners] = useState(defaultBanners);

  /* ================= LOAD BANNERS ================= */

useEffect(() => {
  const loadBanners = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/banners"
      );

      const data = await response.json();

      if (
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


  /* ================= CHANGE ================= */

  const handleChange = (
    index,
    field,
    value
  ) => {
    const updatedBanners = [...banners];

    updatedBanners[index] = {
      ...updatedBanners[index],
      [field]: value,
    };

    setBanners(updatedBanners);
  };

  /* ================= IMAGE ================= */

  const handleImageChange = (
    index,
    e
  ) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      handleChange(
        index,
        "image",
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  /* ================= SAVE ================= */

const saveBanners = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/banners",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(banners),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Banner save failed"
      );
    }

    alert(
      "Banners updated successfully! ✅"
    );
  } catch (error) {
    console.error(
      "Banner save error:",
      error
    );

    alert(
      "Banner save failed. Please try again."
    );
  }
};

  /* ================= RESET ================= */

const resetBanners = async () => {
  const confirmReset =
    window.confirm(
      "Are you sure you want to reset all banners?"
    );

  if (!confirmReset) return;

  try {
    const response = await fetch(
      "http://localhost:5000/api/banners",
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Banner reset failed"
      );
    }

    setBanners(defaultBanners);

    alert(
      "Banners reset successfully! ✅"
    );
  } catch (error) {
    console.error(
      "Banner reset error:",
      error
    );

    alert(
      "Banner reset failed. Please try again."
    );
  }
};


  return (
    <div className="customize-banner-page">

      {/* ================= HEADER ================= */}

      <div className="customize-banner-header">

        <div>
          <div className="customize-banner-eyebrow">
            WEBSITE CUSTOMIZATION
          </div>

          <h1 className="customize-banner-title">
            Customize Banner
          </h1>

          <p className="customize-banner-subtitle">
            Manage your home page banners,
            images and promotional content
            from one place.
          </p>
        </div>

        <button
          className="banner-reset-btn"
          onClick={resetBanners}
        >
          ↻ Reset All
        </button>
        <button
        className="banner-close-btn"
        onClick={() => navigate(-1)}
        >
        ✕ Close
        </button>

      </div>


      {/* ================= BANNER LIST ================= */}

      <div className="customize-banner-list">

        {banners.map(
          (banner, index) => (

            <div
              key={index}
              className="customize-banner-card"
            >

              {/* ================= CARD HEADER ================= */}

              <div className="customize-banner-card-header">

                <div className="banner-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div>
                  <span className="banner-label">
                    HOMEPAGE BANNER
                  </span>

                  <h2 className="customize-banner-card-title">
                    Banner {index + 1}
                  </h2>
                </div>

              </div>


              {/* ================= CONTENT ================= */}

              <div className="customize-banner-card-body">

                {/* ================= PREVIEW ================= */}

                <div className="banner-preview-section">

                  <div className="banner-preview-label">
                    LIVE PREVIEW
                  </div>

                  <div className="customize-banner-preview">

                    <img
                      src={banner.image}
                      alt={`Banner ${
                        index + 1
                      }`}
                    />

                    <div className="banner-preview-overlay">

                      <span>
                        {banner.small}
                      </span>

                      <h3>
                        {banner.title
                          .split("\n")
                          .map(
                            (
                              line,
                              lineIndex
                            ) => (
                              <span
                                key={
                                  lineIndex
                                }
                              >
                                {line}

                                {lineIndex <
                                  banner.title.split(
                                    "\n"
                                  ).length -
                                    1 && (
                                  <br />
                                )}
                              </span>
                            )
                          )}
                      </h3>

                      <p>
                        {banner.text}
                      </p>

                      <button
                        type="button"
                      >
                        {banner.button}
                      </button>

                    </div>

                  </div>

                  <p className="preview-note">
                    This is a preview of how
                    your banner content will
                    appear.
                  </p>

                </div>


                {/* ================= FORM ================= */}

                <div className="banner-form-section">

                  {/* SMALL TEXT */}

                  <div className="customize-banner-field">

                    <label>
                      Small Text
                    </label>

                    <input
                      type="text"
                      value={
                        banner.small
                      }
                      onChange={(e) =>
                        handleChange(
                          index,
                          "small",
                          e.target.value
                        )
                      }
                      placeholder="HANDMADE WITH LOVE"
                    />

                  </div>


                  {/* TITLE */}

                  <div className="customize-banner-field">

                    <label>
                      Main Title
                    </label>

                    <textarea
                      value={
                        banner.title
                      }
                      onChange={(e) =>
                        handleChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      rows="3"
                      placeholder="Make Every Moment&#10;Special"
                    />

                    <small>
                      Press Enter to create a
                      new line in the title.
                    </small>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="customize-banner-field">

                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        banner.text
                      }
                      onChange={(e) =>
                        handleChange(
                          index,
                          "text",
                          e.target.value
                        )
                      }
                      rows="3"
                      placeholder="Banner description"
                    />

                  </div>


                  {/* BUTTON */}

                  <div className="customize-banner-field">

                    <label>
                      Button Text
                    </label>

                    <input
                      type="text"
                      value={
                        banner.button
                      }
                      onChange={(e) =>
                        handleChange(
                          index,
                          "button",
                          e.target.value
                        )
                      }
                      placeholder="SHOP NOW"
                    />

                  </div>


                  {/* IMAGE */}

                  <div className="customize-banner-field">

                    <label>
                      Banner Image
                    </label>

                    <div className="banner-upload-box">

                      <div className="upload-icon">
                        ↑
                      </div>

                      <div className="upload-content">

                        <strong>
                          Choose banner image
                        </strong>

                        <span>
                          PNG, JPG or WEBP
                        </span>

                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(
                            index,
                            e
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )
        )}

      </div>


      {/* ================= BOTTOM ACTION ================= */}

      <div className="customize-banner-footer">

        <div className="banner-save-info">

          <span className="save-icon">
            ✓
          </span>

          <div>
            <strong>
              Ready to publish?
            </strong>

            <p>
              Save your changes to update
              the home page banners.
            </p>
          </div>

        </div>

        <button
          className="save-banners-btn"
          onClick={saveBanners}
        >
          💾 Save All Banners
        </button>

      </div>

    </div>
  );
}

export default CustomizeBanner;
