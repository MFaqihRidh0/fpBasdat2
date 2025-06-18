const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  nama: { type: String, required: true }
});
module.exports = mongoose.model('Kategori', schema);
