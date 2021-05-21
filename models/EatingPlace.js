const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const eatingPlaceSchema = new mongoose.Schema({
  name: String,
  cost: Number,
  category: String,
  addresses: [{
    street: String,
    number: Number,
    neighborhood: String,
    zipCode: String,
    uf: String,
    city: String
  }]
}, { timestamps: true });
eatingPlaceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('EatingPlace', eatingPlaceSchema);
