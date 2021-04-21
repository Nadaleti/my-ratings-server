const express = require('express');
const { hasRequiredFields, isValueBetween } = require('../request-validators');
const { handleNotFound, handleInvalidRating, handleMissingRequiredFields, handleFirestoreError } = require('../handlers');
const { db } = require('../firebase.config');
const admin = require('firebase-admin');

const router = express.Router();

router.get('/', async (req, res, next) => {
  let { page, pageSize, filterBy } = req.query;
  pageSize = pageSize ? pageSize : 20;
  const filterValue = filterBy == 'USER' ? req.headers.uid : req.query.placeId;

  const docs = await getRatings(page, pageSize, filterBy, filterValue);
  const ratings = docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    }
  });

  return res.status(200).send(ratings);
});

router.post('/', async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'placeId', 'rating')) {
    return next(handleMissingRequiredFields());
  }

  if (!isValueBetween(req.body.rating, 1, 5)) {
    return next(handleInvalidRating());
  }

  const eatingPlace = await getEatingPlaceById(req.body.placeId);
  if (!eatingPlace.exists) {
    return next({ status: 404, message: 'Eating place not found', code: 'PLACE_NOT_FOUND_ERROR' });
  }

  await db.collection('ratings').doc().create({
    ...req.body,
    userId: req.headers.uid,
    username: req.headers.username,
    created: admin.database.ServerValue.TIMESTAMP
  });

  return res.status(201).send();
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValueBetween(req.body.rating, 1, 5)) {
      return next(handleInvalidRating());
    }

    const doc = await db.collection('ratings').doc(req.params.id);
    const rating = await doc.get();
    if (!rating.exists) {
      return next(handleNotFound('Rating not found'));
    }

    if (rating.userId !== req.headers.uid) {
      return next({ status: 403, message: 'It\'s not allowed to edit other users ratings', code: 'DIFF_USER_RATING_ERROR' });
    }

    if (req.body.rating !== rating.rating || req.body.comment !== rating.comment) {
      await doc.update({ rating: req.body.rating, comment: req.body.comment, lastUpdated: admin.database.ServerValue.TIMESTAMP });
    }

    return res.status(202).send();
  } catch (e) {
    return next(handleFirestoreError(e.code));
  }
});

router.delete('/:id', async (req, res, next) => {
  const doc = db.collection('ratings').doc(req.params.id);
  const rating = await doc.get();
  if (!rating.exists) {
    return next(handleNotFound('Rating not found'));
  }

  if (rating.userId !== req.headers.uid) {
    return next({ status: 403, message: 'It\'s not allowed to edit other users ratings', code: 'DIFF_USER_RATING_ERROR' });
  }

  await doc.delete();
  return res.status(204).send();
});

const getEatingPlaceById = async (id) => {
  return await db.collection('eating-places').doc(id).get();
}

const getRatings = async (page, pageSize, filterBy, filterValue) => {
  let field = 'userId';
  if (filterBy == 'PLACE') field = 'placeId';

  return (await db.collection('ratings')
    .where(field, '==', filterValue)
    .orderBy('created', 'desc')
    .startAt(page * pageSize)
    .limit(pageSize).get()).docs;
}

exports.routes = router;
