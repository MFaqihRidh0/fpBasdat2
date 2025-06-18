const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  nama:    { type: String, required: true },
  alamat:  { type: String },
  kontak:  { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Supplier', schema);
