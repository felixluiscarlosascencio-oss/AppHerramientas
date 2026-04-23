const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM productos ORDER BY nombre ASC
    `);

    res.json({ success: true, data: rows });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { idmarca, nombre, precio, garantia, descripcion, fechacompra } = req.body;

    if (!idmarca || !nombre) {
      return res.status(400).json({
        success: false,
        message: "idmarca y nombre son obligatorios",
      });
    }

    const [result] = await db.query(
      "INSERT INTO productos (idmarca, nombre, precio, garantia, descripcion, fechacompra) VALUES (?, ?, ?, ?, ?, ?)",
      [idmarca, nombre, precio, garantia, descripcion, fechacompra]
    );

    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      id: result.insertId,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      error: error.message,
    });
  }
});


// =======================
// PUT (ACTUALIZAR)
// =======================
router.put("/:id", async (req, res) => {
  try {
    const { idmarca, nombre, precio, garantia, descripcion, fechacompra } = req.body;

    const [result] = await db.query(
      "UPDATE productos SET idmarca=?, nombre=?, precio=?, garantia=?, descripcion=?, fechacompra=? WHERE id=?",
      [idmarca, nombre, precio, garantia, descripcion, fechacompra, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      error: error.message,
    });
  }
});


// =======================
// DELETE
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message,
    });
  }
});

module.exports = router;