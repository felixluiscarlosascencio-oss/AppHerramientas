const express = require("express");
const router = express.Router();
const db = require("../config/db");

//Retorna todas las marcas
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM marcas ORDER BY nombremarca ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener marcas",
        error: err.message,
      });
  }
});

module.exports = router;
