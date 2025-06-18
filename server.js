// server.js (Versi Final Lengkap dengan Perbaikan Edit & Delete)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// hard-coded admin
const ADMIN = { username: 'admin', password: 'admin123' };

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect MongoDB Atlas
mongoose.connect(
  'mongodb+srv://admin:admin123@website-db.m8nmnba.mongodb.net/?retryWrites=true&w=majority&appName=website-db',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Models
const Kategori = require('./models/kategori');
const Produk   = require('./models/produk');
const Supplier = require('./models/supplier');
const Penjualan       = require('./models/penjualan');
const DetailPenjualan = require('./models/detailPenjualan');
const Pembelian          = require('./models/pembelian');
const DetailPembelian    = require('./models/detailPembelian');
const Trash = require('./models/trash');

// Helper untuk memindahkan dokumen ke Trash
async function moveToTrash(collectionName, doc) {
  const t = new Trash({
    originalId:     doc._id,
    collectionName,
    data:           doc.toObject()
  });
  await t.save();
}

// Auth middleware
function checkAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token === 'secret-token') return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// --- ROUTES ---

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    return res.json({ success: true, token: 'secret-token' });
  }
  res.status(401).json({ success: false });
});

// --- CRUD Kategori ---
app.get('/api/kategori', checkAuth, async (req, res) => {
  res.json(await Kategori.find());
});
app.post('/api/kategori', checkAuth, async (req, res) => {
  const kat = new Kategori(req.body);
  await kat.save();
  res.json(kat);
});
app.delete('/api/kategori/:id', checkAuth, async (req, res) => {
  const kat = await Kategori.findById(req.params.id);
  if (!kat) return res.sendStatus(404);
  await moveToTrash('Kategori', kat);
  await kat.deleteOne();
  res.sendStatus(204);
});
// [DITAMBAHKAN] Rute Edit Kategori
app.put('/api/kategori/:id', checkAuth, async (req, res) => {
    const updatedKat = await Kategori.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedKat) return res.sendStatus(404);
    res.json(updatedKat);
});


// --- CRUD Produk ---
app.get('/api/produk', checkAuth, async (req, res) => {
  res.json(await Produk.find().populate('kategori'));
});
app.post('/api/produk', checkAuth, async (req, res) => {
  const p = new Produk(req.body);
  await p.save();
  res.json(p);
});
// [DIPERBAIKI] Rute Delete Produk
app.delete('/api/produk/:id', checkAuth, async (req, res) => {
  const produk = await Produk.findById(req.params.id);
  if (!produk) return res.sendStatus(404);
  await moveToTrash('Produk', produk);
  await produk.deleteOne();
  res.sendStatus(204);
});
// Rute Edit Produk
app.put('/api/produk/:id', checkAuth, async (req, res) => {
    const updatedProduk = await Produk.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('kategori');
    if (!updatedProduk) return res.sendStatus(404);
    res.json(updatedProduk);
});


// --- CRUD Supplier ---
app.get ('/api/supplier',    checkAuth, async (req, res) => {
  res.json(await Supplier.find());
});
app.post('/api/supplier',    checkAuth, async (req, res) => {
  const s = new Supplier(req.body);
  await s.save();
  res.json(s);
});
// [DIPERBAIKI] Rute Delete Supplier
app.delete('/api/supplier/:id', checkAuth, async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.sendStatus(404);
  await moveToTrash('Supplier', supplier);
  await supplier.deleteOne();
  res.sendStatus(204);
});
// [DITAMBAHKAN] Rute Edit Supplier
app.put('/api/supplier/:id', checkAuth, async (req, res) => {
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSupplier) return res.sendStatus(404);
    res.json(updatedSupplier);
});


// --- Transaksi ---
app.post('/api/penjualan', checkAuth, async (req, res) => {
  const { pembeli, items, jenisPembayaran } = req.body;
  let penjualan = new Penjualan({ pembeli, totalHarga: 0, jenisPembayaran });
  await penjualan.save();
  let grandTotal = 0;
  for (let it of items) {
    const prod = await Produk.findById(it.produk);
    if (!prod) continue;
    const sub = prod.harga * it.jumlah;
    grandTotal += sub;
    prod.stok = prod.stok - it.jumlah;
    await prod.save();
    await new DetailPenjualan({
      penjualan: penjualan._id,
      produk:    it.produk,
      jumlah:    it.jumlah,
      totalHarga: sub
    }).save();
  }
  penjualan.totalHarga = grandTotal;
  await penjualan.save();
  res.json({ success: true, penjualanId: penjualan._id });
});

app.get('/api/penjualan', checkAuth, async (req, res) => {
  const list = await Penjualan.find().sort('-tanggal');
  res.json(list);
});

app.post('/api/pembelian', checkAuth, async (req, res) => {
  const { supplierId, items } = req.body;
  let pemb = new Pembelian({ supplier: supplierId, totalHarga: 0 });
  await pemb.save();
  let grandTotal = 0;
  for (let it of items) {
    const prod = await Produk.findById(it.produk);
    if (!prod) continue;
    const sub = it.hargaBeliSatuan * it.jumlah;
    grandTotal += sub;
    prod.stok = prod.stok + it.jumlah;
    await prod.save();
    await new DetailPembelian({
      pembelian:       pemb._id,
      produk:          it.produk,
      jumlah:          it.jumlah,
      hargaBeliSatuan: it.hargaBeliSatuan,
      subtotal:        sub
    }).save();
  }
  pemb.totalHarga = grandTotal;
  await pemb.save();
  res.json({ success: true, pembelianId: pemb._id });
});

app.get('/api/pembelian', checkAuth, async (req, res) => {
  const list = await Pembelian.find()
    .populate('supplier')
    .sort('-tanggal');
  res.json(list);
});

app.get('/api/low-stock', checkAuth, async (req, res) => {
  const list = await Produk.find({
    $expr: { $lte: ['$stok', '$stokMinimum'] }
  });
  res.json(list);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server di http://localhost:${PORT}`));