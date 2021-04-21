const functions = require('firebase-functions');
const cors = require('cors');
const express = require('express');

const { isAuthenticated } = require('./middlewares/authentication');
const eatingPlacesRouter = require('./routes/eating-places');
const ratingsRouter = require('./routes/ratings');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/eating-places', isAuthenticated, eatingPlacesRouter.routes);
app.use('/api/ratings', isAuthenticated, ratingsRouter.routes);
app.use('/api/users', usersRouter.routes);
app.all('*', (req, res, next) => next({ status: 404, message: 'Not found', code: 'PATH_NOT_FOUND' }));
app.use((error, req, res, next) => {
  res.status(error.status || 500).send({
    message: error.message || 'Internal Server Error',
    code: error.code || 'UNKNOWN_ERROR'
  })
});

exports.app = functions.https.onRequest(app);
