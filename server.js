require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Rutas API ────────────────────────────────────────────────
app.use('/api/herramientas',  require('./routes/herramientas'));
app.use('/api/categorias',    require('./routes/categorias'));
app.use('/api/proveedores',   require('./routes/proveedores'));
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/prestamos',     require('./routes/prestamos'));
app.use('/api/devoluciones',  require('./routes/devoluciones'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// ── SPA: redirigir todo al index.html ────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Error handler global ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🔧  APP PRÉSTAMO HERRAMIENTAS');
  console.log('📡  Servidor: http://localhost:' + PORT);
  console.log('🔗  API Herramientas: http://localhost:' + PORT + '/api/herramientas');
  console.log('🔗  API Préstamos:    http://localhost:' + PORT + '/api/prestamos\n');
});

module.exports = app;
