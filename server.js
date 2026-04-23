require('dotenv').config() //Variables de entorno
const express = require('express'); //Framework para crear el servidor

//Middleware para permitir solicitudes desde otros dominios
const cors = require('cors') 

//Middleware para registrar las solicitudes HTTP
const path = require('path'); 

//Puerto del servidor
const app = express(); //Crear el servidor - referencia
const PORT = process.env.PORT || 3000; 

//1. MIDDLEWARES (funcion intermedia)
app.use(cors()) //Permitir solicitudes desde otros dominios
app.use(express.json()) //Permitir recibir datos en formato JSON
app.use(express.urlencoded({ extended: true })) //Permitir recibir datos en formato URL-encoded

//Archivos estáticos servir (frontend)
app.use(express.static(path.join(__dirname, 'public'))) //Carpeta "public" para archivos estáticos

//2. RUTAS (API) Test: Postman
app.use('/api/productos', require('./routes/productos')) //Rutas de la API
app.use('/api/marcas', require('./routes/marcas')) //Rutas de la API

//3. todo lo que no tien ruta o el servidor no lo direccionar
//SPA = Single Page Application -> http://localhost:3000/
//Express V4: app.get('*', () =>{})
//Express V5: app.get('/{*path}', () =>{})
//req (require - solicitud)
//res (response - respuesta)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')) //Enviar el archivo index.html para cualquier ruta no definida
})

//Manejar errores 
app.use((err, req, res, next) => {
    console.error(err); //Registrar el error en la consola
    res.status(500).json({ success: false, message: 'Error interno del servidor' }) //Enviar una respuesta de error al cliente
})

//Iniciar el servidor
app.listen(PORT, () => {
  //URL : APLICACION WEB
  console.log(`Servidor Web ejecutandose en http://localhost:${PORT}`);
  //API productos
  console.log(`API productos es http://localhost:${PORT}/api/productos`);
  //API marcas
  console.log(`API marcas es http://localhost:${PORT}/api/marcas`);
});

module.exports = app; //Exportar el servidor para pruebas unitarias