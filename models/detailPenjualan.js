const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  penjualan:        { type: mongoose.Schema.Types.ObjectId, ref: 'Penjualan', required: true },
  produk:           { type: mongoose.Schema.Types.ObjectId, ref: 'Produk',    required: true },
  jumlah:           { type: Number, required: true },
  jenisPembayaran:  { type: String, enum: ['Cash','Credit'], default: 'Cash' },
  totalHarga:       { type: Number, required: true }
});
module.exports = mongoose.model('DetailPenjualan', schema);
