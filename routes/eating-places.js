const express = require('express');
const { hasRequiredFields } = require('../request-validators');
const { handleNotFound, handleMissingRequiredFields } = require('../handlers');
const { isFirebaseAuthenticated } = require('../middlewares/authentication');
const EatingPlace = require('../models/EatingPlace');

const router = express.Router();
const DEFAULT_PAGE_SIZE = 15;

router.get('/', async (req, res) => {
  const { page, pageSize, category, name } = req.query;
  const response = await getEatingPlaces(page, !pageSize ? DEFAULT_PAGE_SIZE : pageSize, category, name);
  const eatingPlaces = response.docs.map((doc) => eatingPlaceMapper(doc._doc));

  return res.status(200).send({
    page: response.page,
    totalPages: response.totalPages,
    total: response.total,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
    eatingPlaces
  });
});

router.get('/:id', async (req, res, next) => {
  const doc = await EatingPlace.findById(req.params.id).lean();

  if (!doc) {
    return next(handleNotFound('Place not found'));
  }

  return res.status(200).send(eatingPlaceMapper(doc));
});

router.post('/', isFirebaseAuthenticated, async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'category', 'cost')) {
    return next(handleMissingRequiredFields());
  }

  const eatingPlace = new EatingPlace({
    ...req.body,
    addresses: req.body.hasOwnProperty('addresses') ? req.body.addresses : [],
    category: req.body.category.toUpperCase(),
  });

  await eatingPlace.save();
  return res.status(201).send();
});

router.put('/:id', isFirebaseAuthenticated, async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'category', 'cost', 'addresses')) {
    return next(handleMissingRequiredFields());
  }

  await EatingPlace.findByIdAndUpdate(req.params.id, { ...req.body });
  return res.status(202).send();
});

router.delete('/:id', isFirebaseAuthenticated, async (req, res) => {
  await EatingPlace.deleteOne({ '_id': req.params.id });
  return res.status(204).send();
});

const eatingPlaceMapper = (doc) => {
  const { _id, __v, ...place } = doc;
  return { id: _id, ...place };
}

const getEatingPlaces = async (page, pageSize, category, name) => {
  const query = {};

  if (name) query['name'] = { $regex: '.*' + name + '.*' };
  if (category) query['category'] = category;

  return await EatingPlace.paginate(query, { page, limit: pageSize, sort: 'name' });
}

exports.routes = router;
