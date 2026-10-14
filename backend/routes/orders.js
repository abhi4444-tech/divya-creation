const express = require("express");
const router = express.Router();

const db = require("../db");


// =====================================================
// CREATE ORDER
// =====================================================

router.post("/", async (req, res) => {

    const connection = await db.getConnection();

    try {

        const {
            userId,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            city,
            state,
            pincode,
            paymentMethod,
            items,
            totalAmount
        } = req.body;


        // ===============================
        // VALIDATION
        // ===============================

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }


        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required"
            });
        }


        // ===============================
        // START TRANSACTION
        // ===============================

        await connection.beginTransaction();


        // ===============================
        // CREATE ORDER
        // ===============================

        const [orderResult] =
            await connection.execute(
                `
                INSERT INTO orders
                (
                    user_id,
                    total_amount,
                    status,
                    payment_status,
                    payment_method,
                    customer_name,
                    customer_email,
                    customer_phone,
                    shipping_address,
                    city,
                    state,
                    pincode
                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,

                    Number(totalAmount),

                    "pending",

                    "pending",

                    paymentMethod || "COD",

                    customerName || "",

                    customerEmail || "",

                    customerPhone || "",

                    shippingAddress || "",

                    city || "",

                    state || "",

                    pincode || ""
                ]
            );


        const orderId =
            orderResult.insertId;


            const orderNumber = `DC${String(orderId).padStart(6, "0")}`;

await connection.execute(
  "UPDATE orders SET order_number = ? WHERE id = ?",
  [orderNumber, orderId]
);


        // ===============================
        // SAVE ORDER ITEMS
        // ===============================

        for (const item of items) {

            const price =
                Number(item.price);

            const quantity =
                Number(item.quantity || 1);

            const subtotal =
                price * quantity;


            await connection.execute(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    product_name,
                    product_image,
                    price,
                    quantity,
                    subtotal
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    orderId,

                    item.productId,

                    item.name,

                    item.image || "",

                    price,

                    quantity,

                    subtotal
                ]
            );

        }


        // ===============================
        // COMMIT
        // ===============================

        await connection.commit();


        // ===============================
        // RESPONSE
        // ===============================

        res.status(201).json({

            success: true,

            message:
                "Order placed successfully",

            orderId,
            orderNumber

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create order"

        });


    } finally {

        connection.release();

    }

});


// =====================================================
// GET USER ALL ORDERS
// =====================================================

router.get(
    "/my-orders/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            // ===============================
            // GET ORDERS
            // ===============================

            const [orders] =
                await db.execute(
                    `
                    SELECT
                        id,
                        user_id,
                        total_amount,
                        status,
                        payment_status,
                        payment_method,
                        customer_name,
                        customer_email,
                        customer_phone,
                        shipping_address,
                        city,
                        state,
                        pincode,
                        created_at,
                        updated_at

                    FROM orders

                    WHERE user_id = ?

                    ORDER BY created_at DESC
                    `,
                    [userId]
                );


            // ===============================
            // GET ITEMS
            // ===============================

            for (
                const order of orders
            ) {

                const [items] =
                    await db.execute(
                        `
                        SELECT
                            id,
                            order_id,
                            product_id,
                            product_name,
                            product_image,
                            price,
                            quantity,
                            subtotal

                        FROM order_items

                        WHERE order_id = ?

                        ORDER BY id ASC
                        `,
                        [order.id]
                    );


                order.items = items;

            }


            // ===============================
            // RESPONSE
            // ===============================

            res.json({

                success: true,

                orders

            });


        } catch (error) {

            console.error(
                "GET ORDERS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch orders"

            });

        }

    }
);


// =====================================================
// ADMIN UPDATE ORDER STATUS
// =====================================================

router.put(
    "/:orderId/status",
    async (req, res) => {

        try {

            const {
                orderId
            } = req.params;

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "pending",
                "confirmed",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "failed",
                "cancelled"
            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order status"

                });

            }


            const [result] =
                await db.execute(
                    `
                    UPDATE orders

                    SET status = ?

                    WHERE id = ?
                    `,
                    [
                        status,
                        orderId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"

                });

            }


            res.json({

                success: true,

                message:
                    "Order status updated"

            });


        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update order status"

            });

        }

    }
);

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

router.put(
  "/:orderId/payment",
  async (req, res) => {

    try {

      const { orderId } =
        req.params;

      const { paymentStatus } =
        req.body;


      // =================================================
      // COD / PAYMENT PENDING
      // =================================================

      if (
        paymentStatus === "pending"
      ) {

        const [result] =
          await db.execute(
            `
            UPDATE orders

            SET
              payment_status = 'pending',
              status = 'pending'

            WHERE id = ?
            `,
            [orderId]
          );


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({

            success: false,

            message:
              "Order not found"

          });

        }


        return res.json({

          success: true,

          message:
            "COD order placed successfully"

        });

      }


      // =================================================
      // ONLINE PAYMENT SUCCESS
      // =================================================

      if (
        paymentStatus === "paid"
      ) {

        const [result] =
          await db.execute(
            `
            UPDATE orders

            SET
              payment_status = 'paid',
              status = 'confirmed'

            WHERE id = ?
            `,
            [orderId]
          );


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({

            success: false,

            message:
              "Order not found"

          });

        }


        return res.json({

          success: true,

          message:
            "Payment successful"

        });

      }


      // =================================================
      // PAYMENT FAILED
      // =================================================

      if (
        paymentStatus === "failed"
      ) {

        const [result] =
          await db.execute(
            `
            UPDATE orders

            SET
              payment_status = 'failed',
              status = 'failed'

            WHERE id = ?
            `,
            [orderId]
          );


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({

            success: false,

            message:
              "Order not found"

          });

        }


        return res.json({

          success: true,

          message:
            "Payment marked as failed"

        });

      }


      // =================================================
      // INVALID STATUS
      // =================================================

      return res.status(400).json({

        success: false,

        message:
          "Invalid payment status"

      });


    } catch (error) {

      console.error(
        "PAYMENT UPDATE ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to update payment"

      });

    }

  }
);

// =====================================================
// GET ALL ORDERS - ADMIN
// =====================================================

router.get("/admin/all", async (req, res) => {
  try {

    const [orders] = await db.query(`
      SELECT
        id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        state,
        pincode,
        total_amount,
        payment_method,
        payment_status,
        status,
        created_at,
        updated_at
      FROM orders
      ORDER BY created_at DESC
    `);

    // Get items for every order
    for (const order of orders) {

      const [items] = await db.query(
        `
        SELECT
          id,
          order_id,
          product_id,
          product_name,
          product_image,
          price,
          quantity,
          subtotal
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
        `,
        [order.id]
      );

      order.items = items;
    }

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.error(
      "GET ADMIN ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load orders",
      error: error.message
    });

  }
});



module.exports = router;
