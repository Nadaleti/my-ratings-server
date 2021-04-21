const admin = require('firebase-admin');

const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED_ERROR' });
  }

  const split = authorization.split('Bearer ');
  const token = split[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.headers = { ...req.headers, uid: decodedToken.uid, email: decodedToken.email, username: decodedToken.name };
    return next();
  } catch (e) {
    console.error(e);
    return res.status(401).send({ message: 'Unauthorized', code: 'UNAUTHORIZED_ERROR' });
  }
}

exports.isAuthenticated = isAuthenticated;
