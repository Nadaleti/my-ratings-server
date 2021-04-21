const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('./credentials.json'),
});

exports.db = admin.firestore();