const express = require('express');
const bodyParsery = require('body-parser');
const koneksi = require('./config/database');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Membuat server, Use express static folder
app.use(express.static("./public"))

//! Use Of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.hostname + '-' + 
        Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage:storage
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/jayakarta', (req, res) => {
    res.send('Hello jayakarta!');
});

// Get data
app.get('/api/movie', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM movies';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// Menampilkan data tertentu
app.get('/api/movie-specific/:id', (req, res) => {
    // buat query sql
    const querySql = 'SELECT judul,rating,deskripsi FROM movies where id=?';

    // jalankan query
    koneksi.query(querySql,req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// Insert Data
app.post('/api/movies', upload.single('image'), (req, res) => {

    if (!req.file) {
        console.log("No File Upload...");
        const data = {...req.body};
        const judul = data.judul;
        const rating = data.rating;
        const deskripsi = data.deskripsi;    
        const sutradara = data.sutradara;
        const querySql = 'INSERT INTO movies (judul, rating, deskripsi, sutradara) VALUES(?, ?, ?, ?)' ;

        // Jalankan Query
        koneksi.query(querySql, [judul, rating, deskripsi, sutradara], (err, rows, field) => {
            if (err) {
                return res.status(500).json({message: 'Ada Kesalahan', error: err});
            }

            res.status(201).json({success: true, message: 'Data berhasil ditambah' +data});
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5001/images/' + req.file.filename
        // buat variable penampung data dan query sql
        const data = { ...req.body};
        const querySql = 'INSERT INTO movies (judul,rating,deskripsi,sutradara,foto) values (?,?,?,?,?)';
        const judul = req.body.judul;
        const rating = req.body.rating;
        const deskripsi = req.body.deskripsi;
        const sutradara = req.body.sutradara;
        const foto = imgsrc;

        // Jalankan Query
        koneksi.query(querySql,[judul, rating, deskripsi, sutradara, foto], (err, rows, field) => {
            // Error Handling
            if (err) {
                return res.status(500).json({message: 'Gagal Insert Data', error: err});
            }

            // Jika Request Berhasil
            res.status(201).json({success: true, message: 'Berhasil Insert Data'});
        });
    }
});

// Filter data
app.get('/api/movies/filter/:judul', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM movies where judul like \'%' + req.params.judul + '%\';';
    console.log(querySql);

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// Delete Data
app.delete('/api/movies/:id', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    // const querySearch = 'SELECT * FROM movies WHERE id=?';
    const queryDelete = 'DELETE from movies where id=?';
    koneksi.query(queryDelete,req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// Update Data
app.post('/api/movies/update', function (req, res) {
    const data = {...req.body};
    const id = data.id;
    const judul = data.judul;
    const rating = data.rating;
    const deskripsi = data.deskrispi;
    const sutradara = data.sutradara;
    const queryStr = 'UPDATE movies SET judul = ?, rating = ?, deskripsi = ?, sutradara = ? WHERE id = ?';
    const values = [judul, rating, deskripsi, sutradara, id]; // id ditempatkan di akhir array values
    koneksi.query(queryStr, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                "success": false,
                "message": "Gagal mengubah data",
                "error": err
            });
        }
        res.status(200).json({
            "success": true,
            "message": "Sukses mengubah data",
            "data": results
        });
    });
});





app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});