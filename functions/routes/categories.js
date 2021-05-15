const express = require('express');
const { hasRequiredFields } = require('../request-validators');
const { handleNotFound, handleMissingRequiredFields } = require('../handlers');
const iconProviders = require('../constants/icon-providers.const');
const { isApiKeyAuthenticated } = require('../middlewares/authentication');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (_, res) => {
  const categories = await Category.find().sort('name');
  const categoriesResponse = categories.map((category) => {
    const { _id, __v, ...rest } = category._doc;
    return { id: _id, ...rest};
  });

  return res.status(200).send({ categories: categoriesResponse });
});

router.get('/icon/providers', (_, res) => res.status(200).send(iconProviders))

router.post('/', isApiKeyAuthenticated, async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'code', 'iconName', 'iconProvider')) {
    return next(handleMissingRequiredFields());
  }

  if (!iconProviders.includes(req.body.iconProvider)) {
    return next({ status: 400, message: `Icon provider ${req.body.iconProvider} is not valid`, code: 'BAD_REQUEST_ERROR' });
  }

  const existingCategory = await Category.findOne({ code: req.body.code });
  if (existingCategory) {
    return next({ status: 409, message: `Category ${req.body.code} already exists`, code: 'DUPLICATED_CATEGORY_ERROR' });
  }

  const category = new Category({
    name: req.body.name,
    code: req.body.code,
    iconName: req.body.iconName,
    iconProvider: req.body.iconProvider
  });

  await category.save();
  return res.status(201).send();
});

router.put('/:code', isApiKeyAuthenticated, async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'iconName', 'iconProvider')) {
    return next(handleMissingRequiredFields());
  }

  if (!iconProviders.includes(req.body.iconProvider)) {
    return next({ status: 400, message: `Icon provider ${req.body.iconProvider} is not valid`, code: 'BAD_REQUEST_ERROR' });
  }

  const existingCategory = await Category.findOne({ code: req.params.code });
  if (!existingCategory) return next(handleNotFound());

  await Category.findOneAndUpdate({ code: req.params.code }, { ...req.body });
  return res.status(202).send();
});

router.delete('/:code', isApiKeyAuthenticated, async (req, res, next) => {
  const existingCategory = await Category.findOne({ code: req.params.code });
  if (!existingCategory) return next(handleNotFound());

  await Category.deleteOne({ 'code': req.params.code });
  return res.status(204).send();
});

exports.routes = router;
