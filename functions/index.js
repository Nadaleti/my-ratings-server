require('dotenv').config();
const functions = require('firebase-functions');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');

const dbUrl = process.env.MONGO_DB_CONNECTION_STRING;
mongoose.connect(dbUrl, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const eatingPlacesRouter = require('./routes/eating-places');
const ratingsRouter = require('./routes/ratings');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/eating-places', eatingPlacesRouter.routes);
app.use('/api/ratings', ratingsRouter.routes);
app.use('/api/users', usersRouter.routes);
app.use('/api/categories', categoriesRouter.routes);
app.all('*', (_, __, next) => next({ status: 404, message: 'Not found', code: 'PATH_NOT_FOUND' }));

app.use((error, _, res, __) => {
  res.status(error.status || 500).send({
    message: error.message || 'Internal Server Error',
    code: error.code || 'UNKNOWN_ERROR'
  })
});

exports.app = functions.https.onRequest(app);
