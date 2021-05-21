const express = require('express');
const admin = require('firebase-admin');
const { hasRequiredFields } = require('../request-validators');
const { handleMissingRequiredFields } = require('../handlers');

const router = express.Router();

router.post('/', async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'displayName', 'email', 'password', 'passwordConfirmation')) {
    return handleMissingRequiredFields(next);
  }

  if (req.body.password !== req.body.passwordConfirmation) {
    next({ status: 400, message: 'Password and password confirmation are not the same', code: 'PASSWORD_MISMATCH_ERROR' });
    return;
  }

  try {
    await admin.auth().createUser({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password
    });

    return res.status(201).send();
  } catch (e) {
    if (e.errorInfo) next(getError(e.errorInfo.code));
    else next();
    return;
  }
});

const getError = (error) => {
  switch (error) {
    case 'auth/email-already-exists': return { status: 409, code: 'EMAIL_IN_USE_ERROR', message: 'Email already in use' };
    case 'auth/invalid-email': return { status: 400, code: 'INVALID_EMAIL_ERROR', message: 'The provided email is invalid' };
    case 'auth/invalid-password': return { status: 400, code: 'WEAK_PASSWORD_ERROR', message: 'The provided password is weak' };
    default: return { code: 'UNKNOWN_ERROR' };
  }
}

exports.routes = router;
