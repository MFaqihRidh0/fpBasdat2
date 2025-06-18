const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  nama:          { type: String, required: true },
  stok:          { type: Number, default: 0 },
  harga:         { type: Number, required: true },
  stokMinimum:   { type: Number, default: 5 },
  kategori:      { type: mongoose.Schema.Types.ObjectId, ref: 'Kategori' }
});
module.exports = mongoose.model('Produk', schema);
