require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');

const dbUrl = process.env.MONGO_DB_CONNECTION_STRING;

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

mongoose.set('useFindAndModify', false);
mongoose.connect(dbUrl, { useNewUrlParser: true })
  .then(() => app.listen(process.env.PORT || 3333, () => console.log('App is up and running!')))
  .catch(error => console.error(error));
