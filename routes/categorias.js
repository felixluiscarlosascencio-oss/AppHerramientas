const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener categorias', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Categoria no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  try {
    const [result] = await db.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre.trim(), descripcion || null]);
    res.status(201).json({ success: true, message: 'Categoría creada', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  try {
    const [r] = await db.query('SELECT id FROM categorias WHERE id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    await db.query('UPDATE categorias SET nombre=?, descripcion=? WHERE id=?', [nombre.trim(), descripcion || null, req.params.id]);
    res.json({ success: true, message: 'Categoría actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: err.message });
  }
});

module.exports = router;
