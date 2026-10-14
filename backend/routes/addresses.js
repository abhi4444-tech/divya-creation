const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

// Actual user_addresses table ke allowed columns
const ADDRESS_FIELDS = {
  label: "label",
  recipient_name: "recipient_name",
  recipientName: "recipient_name",
  full_name: "recipient_name",
  fullName: "recipient_name",
  phone: "phone",
  address_line1: "address_line1",
  addressLine1: "address_line1",
  address_line2: "address_line2",
  addressLine2: "address_line2",
  landmark: "landmark",
  city: "city",
  state: "state",
  pincode: "pincode",
  is_default: "is_default",
  isDefault: "is_default",
};

function getUserId(req) {
  return Number(req.user?.id);
}

function getAddressId(req) {
  return Number(req.params.id);
}

function validId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

// GET: Logged-in user ke saare addresses
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!validId(userId) || userId !== Number(req.params.userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access these addresses",
      });
    }

    const [addresses] = await db.query(
      `SELECT * FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );

    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
});

// POST: Naya address add karna
router.post("/", requireAuth, async (req, res) => {
  let connection;

  try {
    const userId = getUserId(req);

    if (!validId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    const body = req.body || {};

    const recipientName = String(
      body.recipient_name ?? body.recipientName ??
      body.full_name ?? body.fullName ?? ""
    ).trim();

    const phone = String(body.phone ?? "").trim();
    const addressLine1 = String(
      body.address_line1 ?? body.addressLine1 ?? ""
    ).trim();
    const city = String(body.city ?? "").trim();
    const state = String(body.state ?? "").trim();
    const pincode = String(body.pincode ?? "").trim();

    if (
      !recipientName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone, address, city, state and pincode are required",
      });
    }

    const requestedDefault =
      body.is_default === true ||
      body.is_default === 1 ||
      body.is_default === "1" ||
      body.isDefault === true ||
      body.isDefault === 1 ||
      body.isDefault === "1";

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM user_addresses WHERE user_id = ? LIMIT 1",
      [userId]
    );

    const makeDefault = requestedDefault || existing.length === 0;

    if (makeDefault) {
      await connection.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
        [userId]
      );
    }

    const [result] = await connection.query(
      `INSERT INTO user_addresses
       (
         user_id, label, recipient_name, phone,
         address_line1, address_line2, landmark,
         city, state, pincode, is_default
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        String(body.label ?? "Home").trim().slice(0, 30) || "Home",
        recipientName,
        phone,
        addressLine1,
        String(body.address_line2 ?? body.addressLine2 ?? "").trim(),
        String(body.landmark ?? "").trim(),
        city,
        state,
        pincode,
        makeDefault ? 1 : 0,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addressId: result.insertId,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Add address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  } finally {
    if (connection) connection.release();
  }
});

// PUT: Existing address edit karna
router.put("/edit/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const addressId = getAddressId(req);

    if (!validId(userId) || !validId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or address",
      });
    }

    const body = req.body || {};
    const updates = new Map();

    for (const [inputKey, column] of Object.entries(ADDRESS_FIELDS)) {
      if (body[inputKey] !== undefined && !updates.has(column)) {
        updates.set(column, body[inputKey]);
      }
    }

    if (updates.size === 0) {
      return res.status(400).json({
        success: false,
        message: "No address fields provided",
      });
    }

    if (updates.has("recipient_name")) {
      const value = String(updates.get("recipient_name") ?? "").trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "Recipient name is required",
        });
      }

      updates.set("recipient_name", value);
    }

    if (updates.has("phone")) {
      const value = String(updates.get("phone") ?? "").trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "Phone is required",
        });
      }

      updates.set("phone", value);
    }

    if (updates.has("is_default")) {
      const value = updates.get("is_default");
      updates.set(
        "is_default",
        value === true || value === 1 || value === "1" ? 1 : 0
      );
    }

    const [owned] = await db.query(
      "SELECT id FROM user_addresses WHERE id = ? AND user_id = ? LIMIT 1",
      [addressId, userId]
    );

    if (owned.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wantsDefault = updates.get("is_default") === 1;
    updates.delete("is_default");

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (wantsDefault) {
        await connection.query(
          "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
          [userId]
        );
      }

      const entries = [...updates.entries()];

      if (entries.length > 0) {
        const assignments = entries.map(([column]) => `\`${column}\` = ?`);
        const values = entries.map(([, value]) => value);

        await connection.query(
          `UPDATE user_addresses
           SET ${assignments.join(", ")}
           WHERE id = ? AND user_id = ?`,
          [...values, addressId, userId]
        );
      }

      if (wantsDefault) {
        await connection.query(
          `UPDATE user_addresses
           SET is_default = 1
           WHERE id = ? AND user_id = ?`,
          [addressId, userId]
        );
      }

      await connection.commit();

      return res.json({
        success: true,
        message: "Address updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
});

// DELETE: Address delete karna
router.delete("/:id", requireAuth, async (req, res) => {
  let connection;

  try {
    const userId = getUserId(req);
    const addressId = getAddressId(req);

    if (!validId(userId) || !validId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or address",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, is_default
       FROM user_addresses
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [addressId, userId]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await connection.query(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (Number(rows[0].is_default) === 1) {
      const [remaining] = await connection.query(
        `SELECT id FROM user_addresses
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [userId]
      );

      if (remaining.length > 0) {
        await connection.query(
          `UPDATE user_addresses
           SET is_default = 1
           WHERE id = ? AND user_id = ?`,
          [remaining[0].id, userId]
        );
      }
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  } finally {
    if (connection) connection.release();
  }
});

// PATCH: Default address set karna
router.patch("/default/:id", requireAuth, async (req, res) => {
  let connection;

  try {
    const userId = getUserId(req);
    const addressId = getAddressId(req);

    if (!validId(userId) || !validId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or address",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [owned] = await connection.query(
      `SELECT id FROM user_addresses
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [addressId, userId]
    );

    if (owned.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await connection.query(
      "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
      [userId]
    );

    await connection.query(
      `UPDATE user_addresses
       SET is_default = 1
       WHERE id = ? AND user_id = ?`,
      [addressId, userId]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Set default address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;