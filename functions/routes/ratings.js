const express = require('express');
const { hasRequiredFields, isValueBetween } = require('../request-validators');
const { handleNotFound, handleInvalidRating, handleMissingRequiredFields } = require('../handlers');
const { isFirebaseAuthenticated } = require('../middlewares/authentication');
const EatingPlace = require('../models/EatingPlace');
const Rating = require('../models/Rating');

const router = express.Router();

router.get('/', async (req, res) => {
  let { page, pageSize, filterBy } = req.query;
  pageSize = pageSize ? pageSize : 20;
  const filterValue = filterBy == 'USER' ? req.headers.uid : req.query.placeId;

  const response = await getRatings(page, pageSize, filterBy, filterValue);
  const ratings = response.docs.map((doc) => {
    const { _id, __v, ...rating } = doc;
    return { id: _id, ...rating };
  });

  return res.status(200).send({
    page: response.page,
    totalPages: response.totalPages,
    total: response.total,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
    ratings
  });
});

router.post('/', isFirebaseAuthenticated, async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'placeId', 'rating')) {
    return next(handleMissingRequiredFields());
  }

  if (!isValueBetween(req.body.rating, 1, 5)) {
    return next(handleInvalidRating());
  }

  if ((req.body.title || req.body.comment) && !hasRequiredFields(req.body, 'title', 'comment')) {
    return next({ status: 400, message: 'Missing title or comment', code: 'MISSING_TITLE_OR_COMMENT_ERROR' });
  }

  const doesPlaceExists = await EatingPlace.exists({ '_id': req.body.placeId });
  if (!doesPlaceExists) {
    return next({ status: 404, message: 'Eating place not found', code: 'PLACE_NOT_FOUND_ERROR' });
  }

  const rating = new Rating({
    userId: req.headers.uid,
    username: req.headers.username,
    ...req.body
  });

  await rating.save();
  return res.status(201).send();
});

router.put('/:id', isFirebaseAuthenticated, async (req, res, next) => {
  if (!isValueBetween(req.body.rating, 1, 5)) {
    return next(handleInvalidRating());
  }

  const rating = await Rating.findById(req.params.id).lean();
  if (!rating) return next(handleNotFound('Rating not found'));
  if (rating.userId !== req.headers.uid) {
    return next({ status: 403, message: 'It\'s not allowed to edit other users ratings', code: 'DIFF_USER_RATING_ERROR' });
  }

  if (req.body.rating !== rating.rating || req.body.comment !== rating.comment, req.body.title !== rating.title) {
    await Rating.findByIdAndUpdate(req.params.id, {
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment
    });
  }

  return res.status(202).send();
});

router.delete('/:id', isFirebaseAuthenticated, async (req, res, next) => {
  const rating = await Rating.findById(req.params.id).lean();
  if (!rating) return next(handleNotFound('Rating not found'));

  if (rating.userId !== req.headers.uid) {
    return next({ status: 403, message: 'It\'s not allowed to edit other users ratings', code: 'DIFF_USER_RATING_ERROR' });
  }

  await Rating.deleteOne('_id', req.params.id);
  return res.status(204).send();
});

const getRatings = async (page, pageSize, filterBy, filterValue) => {
  let field = 'userId';
  if (filterBy == 'PLACE') field = 'placeId';

  return await Rating.paginate({ [field]: filterValue }, { page, limit: pageSize, sort: 'createdAt' });
}

exports.routes = router;
