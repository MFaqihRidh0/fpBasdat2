// models/trash.js
const mongoose = require('mongoose');   // ← tambahkan ini

const schema = new mongoose.Schema({
  originalId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionName: { type: String, required: true },
  data:           { type: mongoose.Schema.Types.Mixed, required: true },
  deletedAt:      { type: Date, default: Date.now }
}, {
  collection: 'trash'   // override nama koleksi jadi 'trash'
});

module.exports = mongoose.model('Trash', schema);
