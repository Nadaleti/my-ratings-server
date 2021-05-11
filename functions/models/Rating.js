const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ratingSchema = new mongoose.Schema({
  userId: String,
  username: String,
  placeId: String,
  title: String,
  comment: String,
  rating: Number
}, { timestamps: true });
ratingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Rating', ratingSchema);
