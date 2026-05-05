const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre AS nombre_usuario, h.nombre AS nombre_herramienta,
        DATE_FORMAT(d.fecha_devo,'%Y-%m-%d') AS fecha_devo
      FROM devoluciones d
      JOIN usuarios u ON d.id_usuario = u.id
      JOIN herramientas h ON d.id_herramienta = h.id
      ORDER BY d.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

module.exports = router;
