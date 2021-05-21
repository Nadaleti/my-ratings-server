const admin = require('firebase-admin');
const ApiKey = require('../models/ApiKey');

const isFirebaseAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED_ERROR' });
  }

  const split = authorization.split('Bearer ');
  const token = split[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken.uid || !decodedToken.email || !decodedToken.name) {
      return res.status(403).send({ message: 'Forbidden', code: 'FORBIDDEN_ERROR' });
    }

    res.headers = { ...req.headers, uid: decodedToken.uid, email: decodedToken.email, username: decodedToken.name };
    return next();
  } catch (e) {
    console.error(e);
    return res.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED_ERROR' });
  }
}

const isApiKeyAuthenticated = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const apiSecretHeader = req.headers['x-api-secret'];

  if (!apiKeyHeader || !apiSecretHeader) {
    return res.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED_ERROR' });
  }

  const apiKey = await ApiKey.findOne({ apiKey: apiKeyHeader });
  if (!apiKey || apiKey.apiSecret !== apiSecretHeader) {
    return res.status(403).send({ message: 'Forbidden', code: 'FORBIDDEN_ERROR' });
  }

  return next();
}

module.exports = {
  isApiKeyAuthenticated,
  isFirebaseAuthenticated
}
