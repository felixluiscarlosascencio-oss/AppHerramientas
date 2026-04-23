const mysql = require('mysql2/promise') //Acceso BD - MySQL
require('dotenv').config() //Variables de entorno

//pool de conexiones => "conjunto de conexioes disponibles"
// conexion "regyular" (normal) =>usuario 1 => abre > proceso >cierra
//pool "optimizado" => se crear todas las conexiones a ofrecer 
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true, //Esperar si no hay conexiones disponibles
    connectionLimit: 10, //Número máximo de conexiones en el pool
    queueLimit: 50, //Número máximo de solicitudes en espera (0 = sin límite)
    timezone: '-05:00' //Zona horaria UTC
  });

  //Ejecutar la conexion IIFE
  (async () => {
    try {
      const conn = await pool.getConnection(); //conexion prestada
      console.log('Conexión a la base de datos establecida');
      conn.release(); //devolver la conexion al pool
    } catch (error) {
      console.error( error.mesage);
    }
  })();

module.exports = pool;