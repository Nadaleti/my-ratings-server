const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  apiKey: String,
  apiSecret: String
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
