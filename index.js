const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder upload
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const nama = req.body.nama || 'unknown';
    const timestamp = Date.now();
    const cleanNama = nama.replace(/\s/g, '_');
    cb(null, `${cleanNama}_${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Halaman upload peserta
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seleksi Valtz - Upload Video</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui;
          background: #0a0f1e;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          background: rgba(10, 20, 30, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 2rem;
          border: 1px solid #00aaff;
          width: 100%;
          max-width: 500px;
        }
        h1 { color: #88ccff; text-align: center; margin-bottom: 1rem; }
        .subtitle { color: #aaa; text-align: center; margin-bottom: 1.5rem; }
        input, button {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          background: rgba(0,0,0,0.6);
          border: 1px solid #00aaff;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
        }
        button {
          background: linear-gradient(95deg, #1a3f6e, #0a1a2f);
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background: linear-gradient(95deg, #2a5a8c, #0f2a44);
          box-shadow: 0 0 15px #00aaff;
        }
        .back {
          display: block;
          text-align: center;
          color: #88ccff;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🎬 SELEKSI MARGA VALTZ</h1>
        <div class="subtitle">Upload video preset kamu di sini</div>
        <form action="/upload" method="POST" enctype="multipart/form-data">
          <input type="text" name="nama" placeholder="Nama Lengkap / Nickname" required>
          <input type="text" name="asal" placeholder="Asal Daerah / Kota" required>
          <input type="file" name="file" accept="video/*" required>
          <button type="submit">✨ KIRIM VIDEO ✨</button>
        </form>
        <a href="/admin" class="back">🔒 Admin Panel</a>
      </div>
    </body>
    </html>
  `);
});

// Endpoint upload
app.post('/upload', upload.single('file'), (req, res) => {
  const nama = req.body.nama;
  const asal = req.body.asal;
  const file = req.file;

  if (!file) {
    return res.status(400).send('File tidak ditemukan');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Berhasil</title></head>
    <body style="background:#0a0f1e; color:white; text-align:center; padding:50px;">
      <div style="max-width:400px; margin:auto; background:#1a2a4a; padding:30px; border-radius:30px;">
        <h2>✅ VIDEO BERHASIL DIKIRIM!</h2>
        <p>Terima kasih <strong>${nama}</strong> dari <strong>${asal}</strong>.</p>
        <a href="/" style="color:#00aaff;">← Kirim video lain</a>
      </div>
    </body>
    </html>
  `);
});

// Admin panel
app.get('/admin', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error membaca folder');
    }

    let fileList = '';
    files.forEach(file => {
      fileList += `<li>📹 <a href="/uploads/${file}" target="_blank" style="color:#88ccff;">${file}</a></li>`;
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Panel - Valtz</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', system-ui;
            background: #0a0f1e;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #88ccff; text-align: center; margin-bottom: 1rem; }
          ul { list-style: none; padding: 0; }
          li {
            background: #1a2a4a;
            margin: 10px 0;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #00aaff;
          }
          a { color: #88ccff; text-decoration: none; }
          .count { text-align: center; color: #aaa; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📁 ADMIN PANEL VALTZ</h1>
          <div class="count">Total: ${files.length} file</div>
          <ul>${fileList}</ul>
          <a href="/" style="display:block; text-align:center; color:#00aaff;">← Halaman Upload</a>
        </div>
      </body>
      </html>
    `);
  });
});

// Akses file
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
