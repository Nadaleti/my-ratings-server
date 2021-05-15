const express = require('express');
const { hasRequiredFields } = require('../request-validators');
const { handleNotFound, handleMissingRequiredFields } = require('../handlers');
const iconProviders = require('../constants/icon-providers.const');
const Category = require('../models/Category');

const router = express.Router();

router.get("/", (_, res) => {
  const categories = await Category.find().sort('name');
  const categoriesResponse = categories.map((category) => {
    const { _id, ...rest } = category;
    return { id: _id, ...rest};
  });

  return res.status(200).send({ categories: categoriesResponse });
});

router.post("/", (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'code', 'iconName', 'iconProvider')) {
    return next(handleMissingRequiredFields());
  }
  
  if (!iconProviders.includes(req.body.iconProvider)) return next({ status: 400, message: `Icon provider ${req.body.iconProvider} is not valid`, code: 'BAD_REQUEST_ERROR' });

  const existingCategory = await Category.find({ code: req.body.code });
  if (existingCategory) return next({ status: 409, message: `Category ${req.body.code} already exists`, code: 'DUPLICATED_CATEGORY_ERROR' });

  const category = new Category({
    name: req.body.name,
    code: req.body.code,
    iconName: req.body.iconName,
    iconProvider: req.body.iconProvider
  });
  
  await category.save();
  return res.status(201);
});

router.put("/:code", (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'iconName', 'iconProvider')) {
    return next(handleMissingRequiredFields());
  }

  if (!iconProviders.includes(req.body.iconProvider)) return next({ status: 400, message: `Icon provider ${req.body.iconProvider} is not valid`, code: 'BAD_REQUEST_ERROR' });

  const existingCategory = await Category.find({ code: req.params.code });
  if (!existingCategory) return next(handleNotFound());

  await Category.findOneAndUpdate(existingCategory._id, { ...req.body });
  return res.status(202);
});

router.delete("/:code", (req, res, next) => {
  const existingCategory = await Category.find({ code: req.params.code });
  if (!existingCategory) return next(handleNotFound());

  await Category.deleteOne('code', req.params.code);
  return res.status(204);
});

exports.routes = router;
