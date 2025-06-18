const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  tanggal:     { type: Date,   default: Date.now },
  totalHarga:  { type: Number, required: true },
  pembeli:     { type: String, required: true }
});
module.exports = mongoose.model('Penjualan', schema);
