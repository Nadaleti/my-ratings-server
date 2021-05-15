const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  cost: Number,
  iconName: String,
  iconProvider: String
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
