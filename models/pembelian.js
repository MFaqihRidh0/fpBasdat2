const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  tanggal:    { type: Date,   default: Date.now },
  totalHarga: { type: Number, required: true },
  supplier:   { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true }
});
module.exports = mongoose.model('Pembelian', schema);
