const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

//Retorna todas las marcas 
router.get('/', async (req, res) => {
  res.status(200).json({ success: true, message: 'metodo get' }) 
});

module.exports = router;