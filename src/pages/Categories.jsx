import { Link, useNavigate } from "react-router-dom";
import "../css/categories.css";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Necklace",
      image: "/images/categories/necklace.jpg",
    },
    {
      name: "Earrings",
      image: "/images/categories/earrings.jpg",
    },
    {
      name: "Bangles",
      image: "/images/categories/bangles.jpg",
    },
    {
      name: "Rings",
      image: "/images/categories/rings.jpg",
    },
    {
      name: "Pendants",
      image: "/images/categories/pendants.jpg",
    },
    {
      name: "Nose Rings",
      image: "/images/categories/nose-rings.jpg",
    },
    {
      name: "Oxidised Jewellery",
      image: "/images/categories/oxidised.jpg",
    },
    {
      name: "Traditional Jewellery",
      image: "/images/categories/traditional.jpg",
    },
    {
      name: "Mangalsutra",
      image: "/images/categories/mangalsutra.jpg",
    },
  ];

  return (
    <main className="categories-page">

      {/* ================= BACK BUTTON ================= */}

      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>


      {/* ================= CATEGORIES CONTAINER ================= */}

      <div className="categories-container">

        {/* ================= PAGE HEADER ================= */}

        <div className="categories-header">

          <h1>
            All Categories
          </h1>

          <p>
            Explore our handmade jewellery collection
          </p>

        </div>


        {/* ================= CATEGORY GRID ================= */}

        <div className="categories-grid">

          {categories.map((category) => (

            <Link
              key={category.name}
              to="/products"
              className="category-card"
            >

              {/* CATEGORY IMAGE */}

              <div className="category-image">

                <img
                  src={category.image}
                  alt={category.name}
                />

              </div>


              {/* CATEGORY NAME */}

              <h2>
                {category.name}
              </h2>

            </Link>

          ))}

        </div>

      </div>

    </main>
  );
}

export default Categories;
