const mysql = require('mysql');
// buat Configure koneksi
const koneksi = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   port: '3308',
   database: 'zahran',
   multipleStatements: true
});
// koneksi database
koneksi.connect((err) => {
   if (err) throw err;
   console.log('MySQL Connected...');
});
module.exports = koneksi;
