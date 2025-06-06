const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json'); // tu archivo de clave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
