require("dotenv").config();
const { requireAuth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const addressRoutes = require("./routes/addresses");

const db = require("./db");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE & CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());


// ORDERS
const orderRoutes =
    require("./routes/orders");

app.use(
    "/api/orders",
    orderRoutes
);

// CART

const cartRoutes =
  require("./routes/cart");

app.use(
  "/api/cart",
  cartRoutes
);

app.use("/api/addresses", addressRoutes);


// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running",
  });
});


// =====================================================
// DATABASE TEST
// =====================================================

app.get("/api/test-db", async (req, res) => {

  try {

    const [result] =
      await db.query(
        "SELECT 1 AS test"
      );

    res.json({
      success: true,
      message:
        "MySQL connected successfully",
      result,
    });

  } catch (error) {

    console.error(
      "Database Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "MySQL connection failed",
      error:
        error.message,
    });

  }

});


// =====================================================
// AUTH
// =====================================================


// ================= REGISTER =================

app.post(
  "/api/auth/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        phone,
        password,
      } = req.body;


      // ================= REQUIRED FIELDS =================

      if (
        !name ||
        !email ||
        !phone ||
        !password
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Name, email, phone and password are required",
        });

      }


      // ================= PASSWORD =================

      if (password.length < 6) {

        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });

      }


      // ================= CLEAN DATA =================

      const cleanName =
        String(name).trim();

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

let cleanPhone = String(phone).trim();

if (/^\d{10}$/.test(cleanPhone)) {
  cleanPhone = `+91${cleanPhone}`;
}

      // ================= CHECK EMAIL =================

      const [existingUsers] =
        await db.query(
          `SELECT id
           FROM users
           WHERE email = ?
           LIMIT 1`,
          [cleanEmail]
        );


      if (
        existingUsers.length > 0
      ) {

        return res.status(409).json({
          success: false,
          message:
            "Email already registered",
        });

      }


      // ================= CHECK PHONE =================

      const [existingPhones] =
        await db.query(
          `SELECT id
           FROM users
           WHERE phone = ?
           LIMIT 1`,
          [cleanPhone]
        );


      if (
        existingPhones.length > 0
      ) {

        return res.status(409).json({
          success: false,
          message:
            "Phone number already registered",
        });

      }


      // ================= HASH PASSWORD =================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // ================= CREATE USER =================

      const [result] =
        await db.query(
          `INSERT INTO users
          (
            name,
            email,
            phone,
            password,
            is_verified
          )
          VALUES (?, ?, ?, ?, ?)`,
          [
            cleanName,
            cleanEmail,
            cleanPhone,
            hashedPassword,
            1,
          ]
        );


// ================= CREATE AUTH COOKIE =================

const token = jwt.sign(
  { id: Number(result.insertId) },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.cookie("dc_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

// ================= SUCCESS =================

return res.status(201).json({
  success: true,
  message: "Registration successful",
  user: {
    id: result.insertId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    is_verified: 1,
  },
});


    } catch (error) {

      console.error(
        "Register Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Registration failed",
        error:
          error.message,
      });



    }

  }
);

// ================= LOGIN =================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [users] = await db.query(
      `SELECT id, name, email, password
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    const token = jwt.sign(
      { id: Number(user.id) },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("dc_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});



app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("dc_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});




app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Session check error:", error);

    res.status(500).json({
      success: false,
      message: "Could not verify login session",
    });
  }
});



// ================= GET USER =================

app.get(
  "/api/auth/user/:id",
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const [users] =
        await db.query(
          `SELECT
            id,
            name,
            email
           FROM users
           WHERE id = ?
           LIMIT 1`,
          [id]
        );


      if (
        users.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });

      }


      res.json({
        success: true,
        user:
          users[0],
      });

    } catch (error) {

      console.error(
        "Get User Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "User fetch failed",
        error:
          error.message,
      });

    }

  }
);


// =====================================================
// BANNERS
// =====================================================


// ================= GET BANNERS =================

app.get(
  "/api/banners",
  async (req, res) => {

    try {

      const [banners] =
        await db.query(
          `SELECT
            id,
            small_text AS small,
            title,
            description AS text,
            button_text AS button,
            button_link AS link,
            image,
            sort_order
           FROM banners
           ORDER BY
             sort_order ASC,
             id ASC`
        );


      res.json({
        success: true,
        banners,
      });

    } catch (error) {

      console.error(
        "Get Banners Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Banners fetch failed",
        error:
          error.message,
      });

    }

  }
);


// ================= SAVE BANNERS =================

app.put(
  "/api/banners",
  async (req, res) => {

    const banners =
      req.body;


    if (
      !Array.isArray(banners)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid banner data",
      });

    }


    const connection =
      await db.getConnection();


    try {

      await connection.beginTransaction();


      await connection.query(
        "DELETE FROM banners"
      );


      for (
        let index = 0;
        index < banners.length;
        index++
      ) {

        const banner =
          banners[index];


        await connection.query(
          `INSERT INTO banners
          (
            small_text,
            title,
            description,
            button_text,
            button_link,
            image,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            banner.small || "",
            banner.title || "",
            banner.text || "",
            banner.button || "",
            banner.link || "/products",
            banner.image || "",
            index,
          ]
        );

      }


      await connection.commit();


      res.json({
        success: true,
        message:
          "Banners saved successfully",
      });

    } catch (error) {

      await connection.rollback();


      console.error(
        "Save Banners Error:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Banners save failed",
        error:
          error.message,
      });

    } finally {

      connection.release();

    }

  }
);


// ================= DELETE BANNERS =================

app.delete(
  "/api/banners",
  async (req, res) => {

    try {

      await db.query(
        "DELETE FROM banners"
      );


      res.json({
        success: true,
        message:
          "Banners deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete Banners Error:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Banners delete failed",
        error:
          error.message,
      });

    }

  }
);


// =====================================================
// PRODUCT HELPERS
// =====================================================


// ================= SAFE JSON =================

function safeJsonParse(
  value,
  fallback
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return fallback;

  }


  if (
    typeof value !== "string"
  ) {

    return value;

  }


  try {

    return JSON.parse(value);

  } catch (error) {

    console.error(
      "JSON Parse Error:",
      error
    );

    return fallback;

  }

}


// ================= PARSE PAGES =================

function parsePages(value) {

  // Already array
  if (
    Array.isArray(value)
  ) {

    return value;

  }


  // Empty
  if (!value) {

    return [];

  }


  // String
  if (
    typeof value === "string"
  ) {

    const trimmed =
      value.trim();


    if (!trimmed) {

      return [];

    }


    // Try JSON

    try {

      const parsed =
        JSON.parse(trimmed);


      if (
        Array.isArray(parsed)
      ) {

        return parsed;

      }


      if (
        typeof parsed === "string"
      ) {

        return [parsed];

      }

    } catch (error) {

      // Old database value
      // such as "new-arrivals"
    }


    // Old single page format

    if (
      [
        "home",
        "new-arrivals",
        "best-sellers",
        "shop",
      ].includes(trimmed)
    ) {

      return [trimmed];

    }

  }


  return [];

}


// ================= FORMAT PRODUCT =================

function formatProduct(
  product
) {

  const parsedImages =
    safeJsonParse(
      product.images,
      []
    );


  const parsedPages =
    parsePages(
      product.pages
    );


  return {

    ...product,

    id:
      Number(product.id),

    pages:
      Array.isArray(
        parsedPages
      )
        ? parsedPages
        : [],

    images:
      Array.isArray(
        parsedImages
      )
        ? parsedImages
        : [],

    price:
      Number(product.price || 0),

    oldPrice:
      product.oldPrice !== null &&
      product.oldPrice !== undefined
        ? Number(product.oldPrice)
        : null,

    stock:
      Number(product.stock || 0),

    rating:
      product.rating !== null &&
      product.rating !== undefined
        ? Number(product.rating)
        : "New",

  };

}


// =====================================================
// PRODUCTS
// =====================================================


// ================= GET PRODUCTS =================
//
// /api/products
//
// /api/products?page=home
//
// /api/products?page=new-arrivals
//
// /api/products?page=best-sellers
//
// /api/products?page=shop
//
// =====================================================

app.get(
  "/api/products",
  async (req, res) => {

    try {

      const requestedPage =
        String(
          req.query.page || ""
        )
          .trim()
          .toLowerCase();


      console.log(
        "Requested product page:",
        requestedPage || "ALL"
      );


      /*
        IMPORTANT:

        We select pages from the products table.

        Make sure your database has a "pages"
        column.
      */

      const [products] =
        await db.query(
          `SELECT
            id,
            name,
            price,
            oldPrice,
            category,
            stock,
            rating,
            description,
            image,
            images,
            pages,
            created_at
           FROM products
           ORDER BY id DESC`
        );


      let formattedProducts =
        products.map(
          formatProduct
        );


      // ================= FILTER =================

      if (
        requestedPage
      ) {

        formattedProducts =
          formattedProducts.filter(
            (product) => {

              return (
                Array.isArray(
                  product.pages
                ) &&
                product.pages.includes(
                  requestedPage
                )
              );

            }
          );

      }


      console.log(
        "Products returned:",
        formattedProducts.length
      );


      res.json({

        success: true,

        products:
          formattedProducts,

      });

    } catch (error) {

      console.error(
        "Get Products Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Products fetch failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

app.get(
  "/api/products/:id",
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const [products] =
        await db.query(
          `SELECT
            id,
            name,
            price,
            oldPrice,
            category,
            stock,
            rating,
            description,
            image,
            images,
            pages,
            created_at
           FROM products
           WHERE id = ?
           LIMIT 1`,
          [id]
        );


      if (
        products.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });

      }


      res.json({

        success: true,

        product:
          formatProduct(
            products[0]
          ),

      });

    } catch (error) {

      console.error(
        "Get Product Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Product fetch failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// ADD PRODUCT
// =====================================================

app.post(
  "/api/products",
  async (req, res) => {

    try {

      const {
        name,
        price,
        oldPrice,
        category,
        stock,
        rating,
        description,
        image,
        images,
        pages,
        page,
      } = req.body;


      console.log(
        "Adding product pages:",
        pages
      );


      if (
        !name ||
        price === undefined ||
        !category
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Name, price and category are required",
        });

      }


      // ================= IMAGES =================

      const imageList =
        Array.isArray(images)
          ? images
          : [];


      const mainImage =
        image ||
        imageList[0] ||
        "";


      // ================= PAGES =================

      let productPages = [];


      if (
        Array.isArray(pages)
      ) {

        productPages =
          pages;

      } else if (
        typeof pages === "string"
      ) {

        productPages =
          parsePages(pages);

      } else if (
        typeof page === "string"
      ) {

        productPages =
          parsePages(page);

      }


      // Clean pages

      const allowedPages = [
        "home",
        "new-arrivals",
        "best-sellers",
        "shop",
      ];


      productPages =
        [
          ...new Set(
            productPages
              .map(
                (item) =>
                  String(item)
                    .trim()
                    .toLowerCase()
              )
              .filter(
                (item) =>
                  allowedPages.includes(
                    item
                  )
              )
          ),
        ];


      /*
        If no page is selected,
        product will not appear on
        Home/New Arrivals/Best Sellers/Shop.
      */


      // ================= INSERT =================

      const [result] =
        await db.query(
          `INSERT INTO products
          (
            name,
            price,
            oldPrice,
            category,
            stock,
            rating,
            description,
            image,
            images,
            pages
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(name).trim(),

            Number(price),

            oldPrice !== undefined &&
            oldPrice !== ""
              ? Number(oldPrice)
              : null,

            category,

            Number(stock || 0),

            rating !== undefined &&
            rating !== "" &&
            rating !== "New"
              ? Number(rating)
              : null,

            description || "",

            mainImage,

            JSON.stringify(
              imageList
            ),

            JSON.stringify(
              productPages
            ),
          ]
        );


      res.status(201).json({

        success: true,

        message:
          "Product added successfully",

        productId:
          result.insertId,

        pages:
          productPages,

      });

    } catch (error) {

      console.error(
        "Add Product Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Product add failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// UPDATE PRODUCT
// =====================================================

app.put(
  "/api/products/:id",
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const {
        name,
        price,
        oldPrice,
        category,
        stock,
        rating,
        description,
        image,
        images,
        pages,
        page,
      } = req.body;


      // ================= PAGES =================

      let productPages = [];


      if (
        Array.isArray(pages)
      ) {

        productPages =
          pages;

      } else if (
        typeof pages === "string"
      ) {

        productPages =
          parsePages(pages);

      } else if (
        typeof page === "string"
      ) {

        productPages =
          parsePages(page);

      }


      const allowedPages = [
        "home",
        "new-arrivals",
        "best-sellers",
        "shop",
      ];


      productPages =
        [
          ...new Set(
            productPages
              .map(
                (item) =>
                  String(item)
                    .trim()
                    .toLowerCase()
              )
              .filter(
                (item) =>
                  allowedPages.includes(
                    item
                  )
              )
          ),
        ];


      // ================= IMAGES =================

      const imageList =
        Array.isArray(images)
          ? images
          : [];


      const mainImage =
        image ||
        imageList[0] ||
        "";


      // ================= UPDATE =================

      const [result] =
        await db.query(
          `UPDATE products
           SET
            name = ?,
            price = ?,
            oldPrice = ?,
            category = ?,
            stock = ?,
            rating = ?,
            description = ?,
            image = ?,
            images = ?,
            pages = ?
           WHERE id = ?`,
          [
            name
              ? String(name).trim()
              : "",

            Number(price || 0),

            oldPrice !== undefined &&
            oldPrice !== ""
              ? Number(oldPrice)
              : null,

            category || "",

            Number(stock || 0),

            rating !== undefined &&
            rating !== "" &&
            rating !== "New"
              ? Number(rating)
              : null,

            description || "",

            mainImage,

            JSON.stringify(
              imageList
            ),

            JSON.stringify(
              productPages
            ),

            id,
          ]
        );


      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });

      }


      res.json({

        success: true,

        message:
          "Product updated successfully",

        pages:
          productPages,

      });

    } catch (error) {

      console.error(
        "Update Product Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Product update failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

app.delete(
  "/api/products/:id",
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const [result] =
        await db.query(
          `DELETE FROM products
           WHERE id = ?`,
          [id]
        );


      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });

      }


      res.json({

        success: true,

        message:
          "Product deleted successfully",

      });

    } catch (error) {

      console.error(
        "Delete Product Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Product delete failed",

        error:
          error.message,

      });

    }

  }
);




/* =========================================
   CATEGORY APIs
========================================= */

// GET ALL CATEGORIES
app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT id, name, created_at FROM categories ORDER BY name ASC"
    );

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Fetch Categories Error:", error);

    res.status(500).json({
      success: false,
      message: "Categories fetch failed",
    });
  }
});

// ADD CATEGORY
app.post("/api/categories", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must be 100 characters or fewer",
      });
    }

    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: {
        id: result.insertId,
        name,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }

    console.error("Add Category Error:", error);

  res.status(500).json({
  success: false,
  message: "Category add failed",
  error: error.message,
  code: error.code,
});
  }
});

// EDIT CATEGORY
app.put("/api/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body.name || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (!name || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Enter a category name up to 100 characters",
      });
    }

    const [result] = await db.query(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category: { id, name },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    console.error("Edit Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Category update failed",
    });
  }
});

// DELETE CATEGORY
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Prevent deleting a category that still has products.
    const [products] = await db.query(
      "SELECT id FROM products WHERE category = ? LIMIT 1",
      [
        (await db.query(
          "SELECT name FROM categories WHERE id = ? LIMIT 1",
          [id]
        ))[0][0]?.name || "",
      ]
    );

    if (products.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This category has products. Move those products to another category first.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Category delete failed",
    });
  }
});



// =====================================================
// WISHLIST
// =====================================================


// ================= GET WISHLIST =================

app.get(
  "/api/wishlist/:userId",
  requireAuth,
  async (req, res) => {

    try {

 const userId = Number(req.params.userId);

if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot access another user's wishlist",
  });
}


      const [wishlist] =
        await db.query(
          `SELECT
            p.id,
            p.name,
            p.price,
            p.oldPrice,
            p.category,
            p.stock,
            p.rating,
            p.description,
            p.image,
            p.images,
            p.pages,
            w.created_at
           FROM wishlist w
           INNER JOIN products p
             ON w.product_id = p.id
           WHERE w.user_id = ?
           ORDER BY w.id DESC`,
          [userId]
        );


      const formattedWishlist =
        wishlist.map(
          formatProduct
        );


      res.json({

        success: true,

        products:
          formattedWishlist,

        wishlist:
          formattedWishlist,

      });

    } catch (error) {

      console.error(
        "Get Wishlist Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Wishlist fetch failed",

        error:
          error.message,

      });

    }

  }
);


// ================= ADD WISHLIST =================

app.post("/api/wishlist", requireAuth, async (req, res) => {

    try {

const userId = Number(req.user.id);
      const productId =
        Number(
          req.body.productId ||
          req.body.product_id
        );


      if (!userId) {

        return res.status(400).json({
          success: false,
          message:
            "User ID is required",
        });

      }


      if (!productId) {

        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });

      }


      const [users] =
        await db.query(
          `SELECT id
           FROM users
           WHERE id = ?
           LIMIT 1`,
          [userId]
        );


      if (
        users.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });

      }


      const [products] =
        await db.query(
          `SELECT id
           FROM products
           WHERE id = ?
           LIMIT 1`,
          [productId]
        );


      if (
        products.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });

      }


      const [existing] =
        await db.query(
          `SELECT id
           FROM wishlist
           WHERE user_id = ?
           AND product_id = ?
           LIMIT 1`,
          [
            userId,
            productId,
          ]
        );


      if (
        existing.length > 0
      ) {

        return res.json({

          success: true,

          alreadyExists: true,

          message:
            "Product already in wishlist",

        });

      }


      await db.query(
        `INSERT INTO wishlist
        (
          user_id,
          product_id
        )
        VALUES (?, ?)`,
        [
          userId,
          productId,
        ]
      );


      res.status(201).json({

        success: true,

        alreadyExists: false,

        message:
          "Product added to wishlist",

      });

    } catch (error) {

      console.error(
        "Add Wishlist Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Wishlist add failed",

        error:
          error.message,

      });

    }

  }
);


// ================= REMOVE WISHLIST =================

app.delete(
  "/api/wishlist/:userId/:productId",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        Number(
          req.params.userId
        );
        if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot modify another user's wishlist",
  });
}

      const productId =
        Number(
          req.params.productId
        );


      if (
        !userId ||
        !productId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Valid User ID and Product ID are required",
        });

      }


      const [result] =
        await db.query(
          `DELETE FROM wishlist
           WHERE user_id = ?
           AND product_id = ?`,
          [
            userId,
            productId,
          ]
        );


      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product is not in wishlist",
        });

      }


      res.json({

        success: true,

        message:
          "Product removed from wishlist",

      });

    } catch (error) {

      console.error(
        "Remove Wishlist Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Wishlist remove failed",

        error:
          error.message,

      });

    }

  }
);


// ================= CHECK WISHLIST =================

app.get(
  "/api/wishlist/:userId/:productId",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        Number(
          req.params.userId
        );

        if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot check another user's wishlist",
  });
}

      const productId =
        Number(
          req.params.productId
        );


      if (
        !userId ||
        !productId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "User ID and Product ID are required",
        });

      }


      const [rows] =
        await db.query(
          `SELECT id
           FROM wishlist
           WHERE user_id = ?
           AND product_id = ?
           LIMIT 1`,
          [
            userId,
            productId,
          ]
        );


      res.json({

        success: true,

        isWishlist:
          rows.length > 0,

      });

    } catch (error) {

      console.error(
        "Check Wishlist Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Wishlist status check failed",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);
