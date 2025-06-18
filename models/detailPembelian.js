const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  pembelian:          { type: mongoose.Schema.Types.ObjectId, ref: 'Pembelian', required: true },
  produk:             { type: mongoose.Schema.Types.ObjectId, ref: 'Produk',    required: true },
  jumlah:             { type: Number, required: true },
  hargaBeliSatuan:    { type: Number, required: true },
  subtotal:           { type: Number, required: true }
});
module.exports = mongoose.model('DetailPembelian', schema);
