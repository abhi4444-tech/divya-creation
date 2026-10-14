const express = require("express");

const router = express.Router();

const db = require("../db");
const { requireAuth } = require("../middleware/auth");


// =====================================================
// GET USER CART
// =====================================================
//
// GET /api/cart/:userId
//
// =====================================================

router.get("/:userId", requireAuth, async (req, res) => {

  try {

const userId = Number(req.params.userId);

if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot access another user's cart",
  });
}


    const [cart] = await db.query(
      `
      SELECT
        c.id AS cart_id,
        c.user_id,
        c.product_id,
        c.quantity,

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
        p.pages

      FROM cart c

      INNER JOIN products p
        ON c.product_id = p.id

      WHERE c.user_id = ?

      ORDER BY c.created_at DESC
      `,
      [userId]
    );


    const formattedCart = cart.map((item) => ({

      cartId:
        Number(item.cart_id),

      userId:
        Number(item.user_id),

      id:
        Number(item.product_id),

      productId:
        Number(item.product_id),

      name:
        item.name,

      price:
        Number(item.price || 0),

      oldPrice:
        item.oldPrice !== null &&
        item.oldPrice !== undefined
          ? Number(item.oldPrice)
          : null,

      category:
        item.category,

      stock:
        Number(item.stock || 0),

      rating:
        item.rating !== null &&
        item.rating !== undefined
          ? Number(item.rating)
          : "New",

      description:
        item.description,

      image:
        item.image,

      images:
        typeof item.images === "string"
          ? (() => {
              try {
                return JSON.parse(item.images);
              } catch {
                return [];
              }
            })()
          : Array.isArray(item.images)
            ? item.images
            : [],

      pages:
        typeof item.pages === "string"
          ? (() => {
              try {
                const parsed =
                  JSON.parse(item.pages);

                return Array.isArray(parsed)
                  ? parsed
                  : [];
              } catch {
                return [];
              }
            })()
          : Array.isArray(item.pages)
            ? item.pages
            : [],

      quantity:
        Number(item.quantity || 1),

    }));


    res.json({

      success: true,

      cart:
        formattedCart,

    });


  } catch (error) {

    console.error(
      "GET CART ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to fetch cart",

      error:
        error.message,

    });

  }

});


// =====================================================
// ADD PRODUCT TO CART
// =====================================================
//
// POST /api/cart
//
// Body:
//
// {
//    userId: 1,
//    productId: 10,
//    quantity: 1
// }
//
// =====================================================

router.post("/", requireAuth, async (req, res) => {

  try {

  const userId = Number(req.user.id);

    const productId =
      Number(
        req.body.productId ||
        req.body.product_id
      );
      if (!Number.isInteger(userId) || userId <= 0) {
  return res.status(400).json({
    success: false,
    message: "Valid User ID is required",
  });
}

    const requestedQuantity = Number(
  req.body.quantity ?? 1
);

if (
  !Number.isInteger(requestedQuantity) ||
  requestedQuantity < 1
) {
  return res.status(400).json({
    success: false,
    message: "Quantity must be a positive integer",
  });
}

    if (!productId) {

      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });

    }


    if (
      requestedQuantity < 1
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Quantity must be at least 1",
      });

    }


    // =================================================
    // CHECK USER
    // =================================================

    const [users] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      );


    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    // =================================================
    // CHECK PRODUCT
    // =================================================

    const [products] =
      await db.query(
        `
        SELECT
          id,
          name,
          stock
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [productId]
      );


    if (products.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    }


    const product =
      products[0];


    const stock =
      Number(product.stock || 0);


    if (stock <= 0) {

      return res.status(400).json({
        success: false,
        message:
          "Product is out of stock",
      });

    }


    // =================================================
    // CHECK EXISTING CART ITEM
    // =================================================

    const [existing] =
      await db.query(
        `
        SELECT
          id,
          quantity
        FROM cart

        WHERE user_id = ?

        AND product_id = ?

        LIMIT 1
        `,
        [
          userId,
          productId,
        ]
      );


    // =================================================
    // EXISTING ITEM
    // =================================================

    if (existing.length > 0) {

      const oldQuantity =
        Number(
          existing[0].quantity || 0
        );


      const newQuantity =
        oldQuantity +
        requestedQuantity;


      if (newQuantity > stock) {

        return res.status(400).json({

          success: false,

          message:
            `Only ${stock} item(s) available in stock`,

        });

      }


      await db.query(
        `
        UPDATE cart

        SET quantity = ?

        WHERE id = ?
        `,
        [
          newQuantity,
          existing[0].id,
        ]
      );


      return res.json({

        success: true,

        message:
          "Cart quantity updated",

        quantity:
          newQuantity,

      });

    }


    // =================================================
    // NEW ITEM
    // =================================================

    if (
      requestedQuantity > stock
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Only ${stock} item(s) available in stock`,

      });

    }


    await db.query(
      `
      INSERT INTO cart
      (
        user_id,
        product_id,
        quantity
      )

      VALUES (?, ?, ?)
      `,
      [
        userId,
        productId,
        requestedQuantity,
      ]
    );


    res.status(201).json({

      success: true,

      message:
        "Product added to cart",

    });


  } catch (error) {
  console.error("ADD CART ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Failed to add product to cart",
  });
}

});


// =====================================================
// UPDATE CART QUANTITY
// =====================================================
//
// PUT /api/cart/:userId/:productId
//
// Body:
//
// {
//    quantity: 3
// }
//
// =====================================================

router.put(
  "/:userId/:productId",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        Number(req.params.userId);
        if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot modify another user's cart",
  });
}

      const productId =
        Number(req.params.productId);

      const quantity =
        Number(req.body.quantity);


      if (!userId || !productId) {

        return res.status(400).json({

          success: false,

          message:
            "Valid User ID and Product ID are required",

        });

      }


      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Quantity must be at least 1",

        });

      }


      // =================================================
      // GET PRODUCT STOCK
      // =================================================

      const [products] =
        await db.query(
          `
          SELECT
            id,
            stock
          FROM products
          WHERE id = ?
          LIMIT 1
          `,
          [productId]
        );


      if (products.length === 0) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found",

        });

      }


      const stock =
        Number(
          products[0].stock || 0
        );


      if (quantity > stock) {

        return res.status(400).json({

          success: false,

          message:
            `Only ${stock} item(s) available in stock`,

        });

      }


      // =================================================
      // UPDATE
      // =================================================

      const [result] =
        await db.query(
          `
          UPDATE cart

          SET quantity = ?

          WHERE user_id = ?

          AND product_id = ?
          `,
          [
            quantity,
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
            "Cart item not found",

        });

      }


      res.json({

        success: true,

        message:
          "Cart quantity updated",

        quantity,

      });


    } catch (error) {

      console.error(
        "UPDATE CART ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to update cart",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// REMOVE PRODUCT FROM CART
// =====================================================
//
// DELETE /api/cart/:userId/:productId
//
// =====================================================

router.delete(
  "/:userId/:productId",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        Number(req.params.userId);
        if (userId !== Number(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "You cannot modify another user's cart",
  });
}

      const productId =
        Number(req.params.productId);


      if (!userId || !productId) {

        return res.status(400).json({

          success: false,

          message:
            "Valid User ID and Product ID are required",

        });

      }


      const [result] =
        await db.query(
          `
          DELETE FROM cart

          WHERE user_id = ?

          AND product_id = ?
          `,
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
            "Product is not in cart",

        });

      }


      res.json({

        success: true,

        message:
          "Product removed from cart",

      });


    } catch (error) {

      console.error(
        "REMOVE CART ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to remove product",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// CLEAR USER CART
// =====================================================
//
// DELETE /api/cart/:userId
//
// =====================================================

router.delete(
  "/:userId",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        Number(req.params.userId);


      if (!userId) {

        return res.status(400).json({

          success: false,

          message:
            "Valid User ID is required",

        });

      }


      await db.query(
        `
        DELETE FROM cart

        WHERE user_id = ?
        `,
        [userId]
      );


      res.json({

        success: true,

        message:
          "Cart cleared successfully",

      });


    } catch (error) {

      console.error(
        "CLEAR CART ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to clear cart",

        error:
          error.message,

      });

    }

  }
);


module.exports = router;
