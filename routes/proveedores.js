const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proveedores ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proveedores WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { razon_social, ruc, contacto, telefono, email } = req.body;
  if (!razon_social?.trim()) return res.status(400).json({ success: false, message: 'La razón social es requerida' });
  try {
    const [result] = await db.query(
      'INSERT INTO proveedores (razon_social, ruc, contacto, telefono, email) VALUES (?,?,?,?,?)',
      [razon_social.trim(), ruc||null, contacto||null, telefono||null, email||null]
    );
    res.status(201).json({ success: true, message: 'Proveedor creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { razon_social, ruc, contacto, telefono, email } = req.body;
  if (!razon_social?.trim()) return res.status(400).json({ success: false, message: 'La razón social es requerida' });
  try {
    const [r] = await db.query('SELECT id FROM proveedores WHERE id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    await db.query('UPDATE proveedores SET razon_social=?,ruc=?,contacto=?,telefono=?,email=? WHERE id=?',
      [razon_social.trim(), ruc||null, contacto||null, telefono||null, email||null, req.params.id]);
    res.json({ success: true, message: 'Proveedor actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM proveedores WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    res.json({ success: true, message: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

module.exports = router;
